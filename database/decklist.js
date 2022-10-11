const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

const { config, config_common } = require('../config');
const { catch_timeout } = require('../util');
const { load_all } = require('../util/Notion');
const logger = require('../util/Logger').getLogger(__filename);

/**
 *  @typedef Deck
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
    this.last_sync = 0;

    this.id_map = config.id.notion.deck;
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
   * @param {ChatInputCommandInteraction} interaction
   */
  async load(interaction) {
    const sync_start = Date.now();
    if (sync_start - this.last_sync <= 60 * 60 * 1000) return;

    await catch_timeout(interaction, async () => await this._load(sync_start));
  }

  /**
   * @param {number} sync_start
   */
  async _load(sync_start) {
    // TODO: Fill database stuff loader

    /** @type {Deck[]} */
    this.decklist = await load_all(
      this.id_map.list,
      { name: 'deck_id', type: 'number' },
      { name: 'name', type: 'title' },
      { name: 'clazz', type: 'select' },
      { name: 'desc', type: 'rich_text' },
      { name: 'author', type: 'rich_text' },
      { name: 'image_url', type: 'rich_text' },
      { name: 'timestamp', type: 'rich_text' },
      { name: 'version', type: 'number' },
    );

    /** @type {Contrib[]} */
    this.contrib = await load_all(
      this.id_map.contrib,
      { name: 'DeckID', type: 'number' },
      { name: 'ContribID', type: 'rich_text' },
    );

    this.last_sync = Date.now();
    logger.info(`syncing success. time duration: ${this.last_sync - sync_start}ms`);
  }
}

module.exports = DeckList;
