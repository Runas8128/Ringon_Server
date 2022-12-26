const axios = require('axios');

const { config: { notion } } = require('../config');
const { Database } = require('../util/Notion');

const char_map = {
  1: '추종자',
  2: '아뮬렛',
  3: '카운트다운 아뮬렛',
  4: '스펠',
};

/**
 * @param {import('./cards').CardPayload} payload
 * @return {import('./cards').Card}
 */
const parse_payload = ({
  card_id, card_name, cost, char_type,
  atk, life, skill_disc,
  evo_atk, evo_life, evo_skill_disc,
}) => ({
  card_id,
  name: card_name,
  cost,
  type: char_map[char_type],
  atk,
  life,
  desc: skill_disc,
  evo_atk,
  evo_life,
  evo_desc: evo_skill_disc,
});

class Cards {
  constructor() {
    this.id_map = notion.cards;
    this.db = new Database(this.id_map.cards);

    /** @type {import('./cards').Card[]} */
    this.cards = [];
  }

  load = () => axios
    .get('https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko')
    .then(({ data: { data } }) => {
      /** @type {import('./cards').CardPayload[]} */
      const cards = data.cards;
      this.cards = cards
        .filter(card => card.card_name)
        .map(parse_payload)
        .sort((card1, card2) => card1.card_id - card2.card_id);
    });
}

module.exports = Cards;
