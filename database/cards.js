const https = require('https');
const axios = require('axios');

const { config } = require('../config');
const { load_all, delete_page, add_all } = require('../util/Notion');

/**
 *  @typedef Card
 *    @property {string} page_id
 *    @property {number} card_id
 *    @property {string} name
 *    @property {number} cost
 *    @property {string} type
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
 *    @property {string} char_type
 *    @property {number} atk
 *    @property {number} life
 *    @property {string} skill_disc
 *    @property {number} evo_atk
 *    @property {number} evo_life
 *    @property {string} evo_skill_disc
 */

class Cards {
  constructor() {
    this.id_map = config.id.notion.cards;

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
    this.cards = (await load_all(
      this.id_map.cards,
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
    )).sort((a, b) => a.card_id < b.card_id);
  }

  async update() {
    console.log('updating card db');
    const resp = await axios.get('https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko');
    /** @type {card_payload[]} */
    const result = resp.data.data.cards;
    await this._update(result);
    return this.cards.length;
  }

  /**
   * @param {card_payload[]} card_payloads
   */
  async _update(card_payloads) {
    for (const card of this.cards) {
      await delete_page(card.page_id);
    }

    const char_map = {
      1: '추종자',
      2: '아뮬렛',
      3: '카운트다운 아뮬렛',
      4: '스펠',
    };

    for (const payload of card_payloads.slice(0, 50)) {
      if (payload.card_name === null) continue;

      await add_all(
        this.id_map.cards,
        { name: 'card_id', type: 'number', value: payload.card_id },
        { name: 'name', type: 'title', value: payload.card_name },
        { name: 'cost', type: 'number', value: payload.cost },
        { name: 'type', type: 'select', value: char_map[payload.char_type] },
        { name: 'atk', type: 'number', value: payload.atk },
        { name: 'life', type: 'number', value: payload.life },
        { name: 'desc', type: 'rich_text', value: payload.skill_disc },
        { name: 'evo_atk', type: 'number', value: payload.evo_atk },
        { name: 'evo_life', type: 'number', value: payload.evo_life },
        { name: 'evo_desc', type: 'rich_text', value: payload.evo_skill_disc },
      );
    }
    await this.load();
  }
}

module.exports = Cards;
