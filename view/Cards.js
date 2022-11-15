const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { eventHandler } = require('../events/btnClick');
const { Card } = require('../database/cards');
const UpDownView = require('./UpDownView');

/** @param {Card}  */
const followerField = ({ cost, atk, life, evo_atk, evo_life, desc, evo_desc }) => [
  { name: '비용', value: cost.toString(), inline: true },
  { name: '공격력/체력', value: `${atk}/${life}`, inline: true },
  { name: '진화 후 공격력/체력', value: `${evo_atk}/${evo_life}`, inline: true },
  { name: '진화 전 설명', value: desc.replace('<br>', '\n') || '...' },
  { name: '진화 후 설명', value: evo_desc.replace('<br>', '\n') || '...', inline: true },
];

/** @param {Card} */
const otherField = ({ cost, desc }) => [
  { name: '비용', value: cost.toString() },
  { name: '설명', value: desc.replace('<br>', '\n') },
];

class View extends UpDownView {
  /**
   * @param {Card[]} cards
   */
  constructor(cards) {
    super();
    this.cards = cards;

    this.prev = eventHandler
      .register((i) => this.update_message(i, (index) => index - 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('≪ 이전 카드')
      .setCustomId(`Card_prev_${Date.now()}`);

    this.next = eventHandler
      .register((i) => this.update_message(i, (index) => index + 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('다음 카드 ≫')
      .setCustomId(`Card_next_${Date.now()}`);
  }

  build_embed() {
    const card = this.cards[this.index];

    return new EmbedBuilder()
      .setTitle(`카드 이름: ${card.name}`)
      .setImage(`https://shadowverse-portal.com/image/card/phase2/common/C/C_${card.card_id}.png`)
      .addFields((card.type == '추종자' ? followerField : otherField)(card));
  }

  build_actionrow() {
    const { card_id } = this.cards[this.index];

    return new ActionRowBuilder()
      .addComponents(
        this.prev,
        this.next,
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('포탈 바로가기')
          .setURL(`https://shadowverse-portal.com/card/${card_id}?lang=ko`),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('일러스트 보기')
          .setURL(`https://svgdb.me/assets/cardanim/${card_id}.mp4`),
      );
  }

  check_range() {
    if (this.index <= 0) this.index = 0;
    this.prev.setDisabled(this.index == 0);
    if (this.index >= this.cards.length - 1) this.index = this.cards.length - 1;
    this.next.setDisabled(this.index == this.cards.length - 1);
  }
}

module.exports = View;
