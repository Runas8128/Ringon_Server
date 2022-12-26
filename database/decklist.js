const { EmbedBuilder, TextChannel } = require('discord.js');

const { config: { notion, discord } } = require('../config');
const Notion = require('../util/Notion');

class DeckList {
  constructor() {
    this.id_map = notion.deck;

    this.list_db = new Notion.Database(this.id_map.list);
    this.contrib_db = new Notion.Database(this.id_map.contrib);
    this.pack_block = new Notion.Block(this.id_map.pack);

    /** @type {import('./decklist').Deck[]} */
    this.decklist = [];
    /** @type {import('./decklist').Contrib[]} */
    this.contrib = [];

    /** @type {TextChannel} */
    this.history = undefined;
  }

  update_pack(new_pack, guild) {
    this.decklist.forEach(this._delete_deck(guild));
    this.pack_block.update(new_pack);
  }

  _delete_deck = guild => deck => {
    this.history ??= guild.channels.cache.find(({ id }) => id == discord.channel.history);
    this.history.send({ embeds: [this.make_deck_embed(deck, guild)] });
    this.list_db.delete(deck.page_id);
  };

  update_deck({ guild, id, updater, desc, image_url }) {
    if (!desc && !image_url) return;

    const deck = this.decklist.find(_deck => _deck.deck_id == id);
    const history_embed = this.make_deck_embed(deck, guild);

    if (desc) deck.desc = desc;
    if (image_url) deck.image_url = image_url;
    deck.version += 1;

    const contribed = this.contrib.some(obj =>
      obj.DeckID == deck.deck_id && obj.ContribID == updater);

    if (updater != deck.author && !contribed) {
      this.contrib.push({ DeckID: deck.deck_id, ContribID: updater });
      this.contrib_db.push(
        { name: 'DeckID', value: deck.deck_id, type: 'title' },
        { name: 'ContribID', value: updater, type: 'rich_text' },
      );
    }

    this.list_db.update(
      deck.page_id,
      ...this.propertify(deck),
    );

    this.history.send({ embeds: [history_embed] });
  }

  make_deck_embed(deck, guild) {
    const deck_info = new EmbedBuilder()
      .setTitle(deck.name)
      .addFields(
        { name: '클래스', value: deck.clazz },
        { name: '등록일', value: deck.timestamp },
      );

    const member_cache = guild.members.cache;
    const author = member_cache.find(member => member.id == deck.author);
    deck_info.setAuthor({
      name: author.displayName ?? '정보없음',
      iconURL: author.displayAvatarURL?.(),
    });

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

  load() {
    this.list_db.load(
      { name: 'page_id', type: 'page_id' },
      { name: 'deck_id', type: 'number' },
      { name: 'name', type: 'title' },
      { name: 'clazz', type: 'select' },
      { name: 'desc', type: 'rich_text' },
      { name: 'author', type: 'rich_text' },
      { name: 'image_url', type: 'rich_text' },
      { name: 'timestamp', type: 'rich_text' },
      { name: 'version', type: 'number' },
    ).then(result =>
      this.decklist = result.sort((a, b) => a.deck_id - b.deck_id));

    this.contrib_db.load(
      { name: 'DeckID', type: 'number' },
      { name: 'ContribID', type: 'rich_text' },
    ).then(result =>
      this.contrib = result);
  }

  upload(deck) {
    deck.version = 1;
    deck.deck_id = this.decklist.at(-1).deck_id + 1;
    deck.timestamp = new Date()
      .toISOString()
      .split('T')[0]
      .replace('-', '/');

    this.list_db.push(...this.propertify(deck))
      .then(resp => {
        deck.page_id = resp.id;
        this.decklist.push(deck);
      });
  }

  propertify = deck => [
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

module.exports = DeckList;
