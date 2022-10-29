const axios = require('axios');

const { config } = require('../config');
const { Database } = require('../util/Notion');
const logger = require('../util/Logger').getLogger(__filename);

/**
 *  @typedef {'추종자'|'아뮬렛'|'카운트다운 아뮬렛'|'스펠'} CardType
 *
 *  @typedef Card
 *    @property {string} page_id
 *    @property {number} card_id
 *    @property {string} name
 *    @property {number} cost
 *    @property {CardType} type
 *    @property {number} atk
 *    @property {number} life
 *    @property {string} desc
 *    @property {number} evo_atk
 *    @property {number} evo_life
 *    @property {string} evo_desc
 *
 *  @typedef card_payload
 *    @property {number} card_id
 *    @property {string} card_name
 *    @property {number} cost
 *    @property {number} char_type
 *    @property {number} atk
 *    @property {number} life
 *    @property {string} skill_disc
 *    @property {number} evo_atk
 *    @property {number} evo_life
 *    @property {string} evo_skill_disc
 */

class Cards {
  constructor() {
    this.id_map = config.notion.cards;
    this.db = new Database(this.id_map.cards);

    this.char_map = {
      1: '추종자',
      2: '아뮬렛',
      3: '카운트다운 아뮬렛',
      4: '스펠',
    };

    /** @type {Card[]} */
    this.cards = [];
  }

  /**
   * @param {string} keyword
   */
  get_match_cards(keyword) {
    return this.cards.filter((card) => card.name.includes(keyword));
  }

  async load() {
    this.cards = (await this.db.load(
      { name: 'page_id', type: 'page_id' },
      { name: 'card_id', type: 'number' },
      { name: 'name', type: 'title' },
      { name: 'cost', type: 'number' },
      { name: 'type', type: 'select' },
      { name: 'atk', type: 'number' },
      { name: 'life', type: 'number' },
      { name: 'desc', type: 'rich_text' },
      { name: 'evo_atk', type: 'number' },
      { name: 'evo_life', type: 'number' },
      { name: 'evo_desc', type: 'rich_text' },
    )).sort((a, b) => a.card_id - b.card_id);
  }

  async update() {
    logger.info('fetching all card info (1/4)');
    const resp = await axios.get('https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko');

    /** @type {card_payload[]} */
    const payloads = resp.data.data.cards;

    logger.info('droping old database (2/4)');
    this.db.drop();
    this.cards = [];

    logger.info('pushing new card info (3/4)');
    for (const payload of payloads) {
      if (payload.card_name === null) continue;

      const new_card = await this.db.push(
        { name: 'card_id', type: 'number', value: payload.card_id },
        { name: 'name', type: 'title', value: payload.card_name },
        { name: 'cost', type: 'number', value: payload.cost },
        { name: 'type', type: 'select', value: this.char_map[payload.char_type] },
        { name: 'atk', type: 'number', value: payload.atk },
        { name: 'life', type: 'number', value: payload.life },
        { name: 'desc', type: 'rich_text', value: payload.skill_disc },
        { name: 'evo_atk', type: 'number', value: payload.evo_atk },
        { name: 'evo_life', type: 'number', value: payload.evo_life },
        { name: 'evo_desc', type: 'rich_text', value: payload.evo_skill_disc },
      );
      payload.page_id = new_card.id;
    }

    logger.info('loading updated card info (4/4)');
    await this.load();
    return this.cards.length;
  }
}

module.exports = Cards;
