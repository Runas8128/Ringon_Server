const { EmbedBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder, APIEmbedField } = require('discord.js');
const { eventHandler } = require('../events/btnClick');

class StudiedEmbedView {
  /**
   * @param {string} customID
   * @param {string} title
   * @param {string} desc
   * @param {APIEmbedField[]} fields
   */
  constructor(customID, title, desc, fields) {
    this.title = title;
    this.desc = desc;
    this.fields = fields;
    this.startIndex = 0;

    this.actionRow = new ActionRowBuilder()
      .addComponents(
        eventHandler.register(async (i) => await this.top(i))
          .setLabel('≪ 맨 앞으로')
          .setCustomId(customID + '_top')
          .setStyle(ButtonStyle.Primary),
        eventHandler.register(async (i) => await this.up(i))
          .setLabel('< 앞으로')
          .setCustomId(customID + '_up')
          .setStyle(ButtonStyle.Primary),
        eventHandler.register(async (i) => await this.down(i))
          .setLabel('뒤로 >')
          .setCustomId(customID + '_down')
          .setStyle(ButtonStyle.Primary),
        eventHandler.register(async (i) => await this.bottom(i))
          .setLabel('맨 뒤로 ≫')
          .setCustomId(customID + '_bottom')
          .setStyle(ButtonStyle.Primary),
      );
  }

  /**
   * @param {ButtonInteraction} interaction
   */
  async update_message(interaction) {
    await interaction.deferUpdate();
    await interaction.message.edit(this.get_updated_msg());
  }

  get_updated_msg() {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(this.title)
          .setDescription(this.desc)
          .addFields(this.fields.slice(this.startIndex, this.startIndex + 10)),
      ],
      components: [this.actionRow],
    };
  }

  async top(i) {
    this.startIndex = 0;
    await this.update_message(i);
  }

  async up(i) {
    this.startIndex -= 10;
    if (this.startIndex < 0) {
      this.startIndex = 0;
    }
    await this.update_message(i);
  }

  async down(i) {
    this.startIndex += 10;
    if (this.startIndex > this.fields.length) {
      this.startIndex = this.fields.length - 10;
    }
    await this.update_message(i);
  }

  async bottom(i) {
    this.startIndex = this.fields.length - 10;
    await this.update_message(i);
  }
}

module.exports = {
  StudiedEmbedView: StudiedEmbedView,
};
