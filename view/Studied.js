const { EmbedBuilder, ButtonStyle, ActionRowBuilder, APIEmbedField } = require('discord.js');
const { eventHandler } = require('../events/btnClick');

const UpDownView = require('./UpDownView');

class StudiedEmbedView extends UpDownView {
  /**
   * @param {string} title
   * @param {string} desc
   * @param {APIEmbedField[]} fields
   */
  constructor(fields) {
    super();

    this.base = new EmbedBuilder()
      .setTitle('감지 키워드 목록입니다!')
      .setDescription('이 목록에 있는 키워드가 메시지의 내용과 일치하면, 해당 메시지를 보내줍니다.');

    this.fields = fields;

    this.top = eventHandler
      .register(async (i) => await this.update_message(i, () => 0))
      .setLabel('≪ 맨 앞으로')
      .setCustomId(`Studied_top_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.up = eventHandler
      .register(async (i) => await this.update_message(i, index => index - 10))
      .setLabel('< 앞으로')
      .setCustomId(`Studied_up_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.down = eventHandler
      .register(async (i) => await this.update_message(i, index => index + 10))
      .setLabel('뒤로 >')
      .setCustomId(`Studied_down_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.bottom = eventHandler
      .register(async (i) => await this.update_message(i, () => this.fields.length - 10))
      .setLabel('맨 뒤로 ≫')
      .setCustomId(`Studied_bottom_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
  }

  build_embed = () => EmbedBuilder.from(this.base.data)
    .addFields(this.fields.slice(this.index, this.index + 10));

  build_actionrow = () => new ActionRowBuilder()
    .addComponents(this.top, this.up, this.down, this.bottom);

  check_range() {
    if (this.index <= 0) this.index = 0;
    this.top.setDisabled(this.index == 0);
    this.up.setDisabled(this.index == 0);

    if (this.index >= this.fields.length - 10) this.index = this.fields.length - 10;
    this.down.setDisabled(this.index == this.fields.length - 10);
    this.bottom.setDisabled(this.index == this.fields.length - 10);
  }
}

module.exports = StudiedEmbedView;
