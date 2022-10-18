const { EmbedBuilder, Guild, TextChannel } = require('discord.js');

const { config, config_common } = require('../config');
const { load_all, update_block_string, delete_page } = require('../util/Notion');

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
    this.id_map = config.id.notion.deck;

    /** @type {TextChannel} */
    this.history = undefined;
  }

  analyze() {
    const total_count = this.decklist.length;
    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    Object.keys(config_common.classes).forEach((clazz) => {
      const count = this.decklist.filter((deck) => deck.clazz == clazz).length;
      if (count == 0) return;

      embed.addFields({
        name: (config_common.classes[clazz]) + clazz,
        value: `${count}개 (점유율: ${(count / total_count * 100).toPrecision(2)}%)`,
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
    this.decklist.forEach(async (deck) => await this._delete_deck(deck, guild));
    update_block_string(this.id_map.pack, new_pack);
  }

  /**
   * @param {Deck} deck
   * @param {Guild} guild
   */
  async _delete_deck(deck, guild) {
    if (this.history === undefined) {
      this.history = guild.channels.cache.find((ch) =>
        ch.id == config.id.discord.channel.history);
    }
    await this.history.send({ embeds: [this.make_deck_embed(deck, guild)] });
    await delete_page(deck.page_id);
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
    const org_deck = Object.assign({}, deck);

    if (desc) deck.desc = deck;
    if (image_url) deck.image_url = image_url;
    deck.version += 1;
    // TODO: Add appending Contributor function

    await this.history.send({ embeds: [this.make_deck_embed(org_deck, guild)] });
    await this.upload(deck);
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
        iconURL: author.displayAvatarURL,
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
    /** @type {Deck[]} */
    this.decklist = (await load_all(
      this.id_map.list,
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
    this.contrib = await load_all(
      this.id_map.contrib,
      { name: 'DeckID', type: 'number' },
      { name: 'ContribID', type: 'rich_text' },
    );
  }

  /**
   * @param {Deck} deck
   */
  async upload(deck) {
    // TODO: Fill this feature
  }
}

module.exports = DeckList;
