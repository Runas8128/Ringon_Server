const { EmbedBuilder, Guild, TextChannel, Client } = require('discord.js');

const { config, config_common } = require('../config');
const Notion = require('../util/Notion');

/**
 *  @typedef Deck
 *    @property {string} page_id
 *    @property {number} deck_id
 *    @property {string} name
 *    @property {string} clazz
 *    @property {string} desc
 *    @property {string} author
 *    @property {string} image_url
 *    @property {string} timestamp
 *    @property {number} version
 *
 *  @typedef Contrib
 *    @property {number} DeckID
 *    @property {string} ContribID
 */

class DeckList {
  constructor() {
    this.id_map = config.notion.deck;

    this.list_db = new Notion.Database(this.id_map.list);
    this.contrib_db = new Notion.Database(this.id_map.contrib);
    this.pack_block = new Notion.Block(this.id_map.pack);

    /** @type {Deck[]} */
    this.decklist = [];

    /** @type {Contrib[]} */
    this.contrib = [];

    /** @type {TextChannel} */
    this.history = undefined;
  }

  /**
   * @param {Client} client
   */
  analyze(client) {
    const total_count = this.decklist.length;
    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    Object.keys(config_common.classes).forEach((clazz) => {
      const count = this.decklist.filter((deck) => deck.clazz == clazz).length;
      if (count == 0) return;

      const class_emoji = client.emojis.cache.find(emoji => emoji.id == config_common.classes[clazz]);
      embed.addFields({
        name: `${class_emoji} ${clazz}`,
        value: `${count}개 (점유율: ${(count / total_count * 100).toPrecision(4)}%)`,
        inline: true,
      });
    });

    return embed;
  }

  /**
   * @param {string} new_pack
   * @param {Guild} guild
   */
  async update_pack(new_pack, guild) {
    for (const deck of this.decklist) {
      await this._delete_deck(deck, guild);
    }
    await this.pack_block.update(new_pack);
  }

  /**
   * @param {Deck} deck
   * @param {Guild} guild
   */
  async _delete_deck(deck, guild) {
    if (this.history === undefined) {
      this.history = guild.channels.cache.find((ch) =>
        ch.id == config.discord.channel.history);
    }
    await this.history.send({ embeds: [this.make_deck_embed(deck, guild)] });
    await this.list_db.delete(deck.page_id);
  }

  /**
   * @param {Guild} guild
   * @param {number} id
   * @param {string} updater
   * @param {string?} desc
   * @param {string?} image_url
   */
  async update_deck(guild, id, updater, desc, image_url) {
    if (!desc && !image_url) return;

    const deck = this.decklist.find(_deck => _deck.deck_id == id);
    const history_embed = this.make_deck_embed(deck, guild);

    if (desc) deck.desc = desc;
    if (image_url) deck.image_url = image_url;
    deck.version += 1;

    if (
      updater != deck.author &&
      !(this.contrib.some(obj =>
        obj.DeckID == deck.deck_id && obj.ContribID == updater))
    ) {
      this.contrib.push({ DeckID: deck.deck_id, ContribID: updater });
      this.contrib_db.push(
        { name: 'DeckID', value: deck.deck_id, type: 'title' },
        { name: 'ContribID', value: updater, type: 'rich_text' },
      );
    }

    await this.list_db.update(
      deck.page_id,
      ...this.propertify(deck),
    );

    await this.history.send({ embeds: [history_embed] });
  }

  /**
   * @param {Deck} deck
   * @param {Guild} guild
   */
  make_deck_embed(deck, guild) {
    const deck_info = new EmbedBuilder()
      .setTitle(deck.name)
      .addFields(
        { name: '클래스', value: deck.clazz },
        { name: '등록일', value: deck.timestamp },
      );

    const member_cache = guild.members.cache;
    const author = member_cache.find(member => member.id == deck.author);
    if (author) {
      deck_info.setAuthor({
        name: author.displayName,
        iconURL: author.displayAvatarURL(),
      });
    }
    else {
      deck_info.setAuthor({
        name: '정보 없음',
      });
    }

    if (deck.version > 1) {
      deck_info.addFields({ name: '업데이트 횟수', value: deck.version });
      const contribs = this.contrib.filter(obj => obj.DeckID == deck.deck_id);
      if (contribs.length > 0) {
        deck_info.addFields({
          name: '기여자 목록',
          value: contribs.map(obj => member_cache.find(m => m.id == obj.ContribID) ?? '(정보 없음)').join(', '),
        });
      }
    }

    if (deck.desc.length > 0) {
      deck_info.addFields({ name: '덱 설명', value: deck.desc, inline: false });
      const hashtags = deck.desc.match(/#(\w+)/g);
      if (hashtags) {
        deck_info.addFields({ name: '해시태그', value: hashtags.join(', ') });
      }
    }

    deck_info.setImage(deck.image_url);
    deck_info.setFooter({ text: `ID: ${deck.deck_id}` });
    return deck_info;
  }

  async load() {
    this.decklist = (await this.list_db.load(
      { name: 'page_id', type: 'page_id' },
      { name: 'deck_id', type: 'number' },
      { name: 'name', type: 'title' },
      { name: 'clazz', type: 'select' },
      { name: 'desc', type: 'rich_text' },
      { name: 'author', type: 'rich_text' },
      { name: 'image_url', type: 'rich_text' },
      { name: 'timestamp', type: 'rich_text' },
      { name: 'version', type: 'number' },
    )).sort((a, b) => a.deck_id - b.deck_id);

    /** @type {Contrib[]} */
    this.contrib = await this.contrib_db.load(
      { name: 'DeckID', type: 'number' },
      { name: 'ContribID', type: 'rich_text' },
    );
  }

  /**
   * @param {Deck} deck
   */
  async upload(deck) {
    deck.version = 1;
    deck.deck_id = this.decklist.at(-1).deck_id + 1;
    deck.timestamp = new Date()
      .toISOString()
      .split('T')[0]
      .replace('-', '/');

    const resp = await this.list_db.push(...this.propertify(deck));

    deck.page_id = resp.id;
    this.decklist.push(deck);
  }

  /**
   * @param {Deck} deck
   * @returns {import('../util/Notion').PropertyPayload[]}
   */
  propertify(deck) {
    return [
      { name: 'deck_id', type: 'number', value: deck.deck_id },
      { name: 'name', type: 'title', value: deck.name },
      { name: 'clazz', type: 'select', value: deck.clazz },
      { name: 'desc', type: 'rich_text', value: deck.desc },
      { name: 'author', type: 'rich_text', value: deck.author },
      { name: 'image_url', type: 'rich_text', value: deck.image_url },
      { name: 'timestamp', type: 'rich_text', value: deck.timestamp },
      { name: 'version', type: 'number', value: deck.version },
    ];
  }
}

module.exports = DeckList;
