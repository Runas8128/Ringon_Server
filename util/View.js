const { EmbedBuilder, ButtonInteraction, ButtonStyle, ActionRowBuilder, APIEmbedField, SelectMenuBuilder, ComponentType } = require('discord.js');
const { config_common } = require('../config');
const { decklist } = require('../database');
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
}

class DeckListView {
  /**
   * @param {object} params
   * @param {string} params.customID
   * @param {import('../database/decklist').Deck[]} params.decks
   */
  constructor({ customID, decks }) {
    this.index = 0;
    this.decks = decks;

    this.prev_button = eventHandler.register(async (i) => await this.prev(i))
      .setLabel('≪ 이전 덱')
      .setCustomId(customID + '_prev')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);
    this.next_button = eventHandler.register(async (i) => await this.next(i))
      .setLabel('다음 덱 ≫')
      .setCustomId(customID + '_next')
      .setStyle(ButtonStyle.Primary);
    if (this.decks.length == 1) this.next_button.setDisabled(true);

    this.actionRow = new ActionRowBuilder()
      .addComponents(
        this.prev_button,
        eventHandler.register(async (i) => await this.select(i))
          .setLabel('메뉴')
          .setCustomId(customID + '_menu')
          .setStyle(ButtonStyle.Secondary),
        this.next_button,
        eventHandler.register(async (i) => await this.delete(i))
          .setLabel('덱 삭제')
          .setCustomId(customID + '_delete')
          .setStyle(ButtonStyle.Danger),
      );
  }

  async prev(i) {
    await i.deferUpdate();

    this.index--;
    await this.update_message(i);
  }

  /**
   * @param {ButtonInteraction} i
   */
  async select(i) {
    await i.deferUpdate();

    const customID = `DeckSelector_${Date.now()}`;
    const options = this.decks.map(({ name, desc, clazz }, index) => {
      const shrunk_desc = desc.length > 100 ?
        desc.substring(0, 97) + '...' : desc;

      return {
        label: name,
        description: shrunk_desc || '...',
        emoji: config_common.classes[clazz],
        value: index.toString(),
      };
    });

    const select = new SelectMenuBuilder()
      .setCustomId(customID)
      .setPlaceholder('')
      .addOptions(options);

    await i.message.edit({
      embeds: [],
      components: [ new ActionRowBuilder().addComponents(select) ],
    });

    const menu = await i.channel.awaitMessageComponent({
      componentType: ComponentType.SelectMenu,
      time: 10 * 1000,
      filter: menubar => menubar.customId === customID,
    });

    await menu.deferUpdate();
    this.index = Number(menu.values[0]);
    await this.update_message(i);
  }

  async next(i) {
    await i.deferUpdate();

    this.index++;
    await this.update_message(i);
  }

  /**
   * @param {ButtonInteraction} i
   */
  async delete(i) {
    await decklist._delete_deck(this.decks[this.index], i.guild);
    this.decks.splice(this.index, 1);
    await this.next(i);
  }

  /**
   * @param {ButtonInteraction} interaction
   */
  async update_message(interaction) {
    await interaction.message.edit(this.get_updated_msg(interaction));
  }

  /**
   * @param {ButtonInteraction} interaction
   */
  get_updated_msg(interaction) {
    if (this.index <= 0) this.index = 0;
    this.prev_button.setDisabled(this.index <= 0);

    if (this.index >= this.decks.length - 1) this.index = this.decks.length - 1;
    this.next_button.setDisabled(this.index >= this.decks.length - 1);

    return {
      embeds: [decklist.make_deck_embed(this.decks[this.index], interaction.guild)],
      components: [this.actionRow],
    };
  }
}

module.exports = {
  StudiedEmbedView: StudiedEmbedView,
  DeckListView: DeckListView,
};
