const { config } = require('../config');
const { load_all } = require('../util/Notion');

/**
 *  @typedef Card
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
    this.cards = load_all(
      this.id_map.cards,
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
    );
  }
}

module.exports = Cards;
