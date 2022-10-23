const { ActionRowBuilder, ButtonStyle, Guild, SelectMenuBuilder, ComponentType, EmbedBuilder, ButtonInteraction } = require('discord.js');
const { config_common } = require('../config');
const { decklist } = require('../database');
const { eventHandler } = require('../events/btnClick');

const UpDownView = require('./UpDownView');

class View extends UpDownView {
  /**
   * @param {import('../database/decklist').Deck[]} decks
   * @param {Guild} guild
   */
  constructor(decks, guild) {
    super();
    this.decks = decks;
    this.guild = guild;

    this.prev = eventHandler
      .register(async (i) => await this.update_message(i, (index) => index - 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('≪ 이전 덱')
      .setCustomId(`Deck_prev_${Date.now()}`);

    this.menu = eventHandler
      .register(async (i) => await this.open_menu(i))
      .setStyle(ButtonStyle.Secondary)
      .setLabel('메뉴')
      .setCustomId(`Deck_menu_${Date.now()}`)
      .setDisabled(this.decks.length == 0);

    this.next = eventHandler
      .register(async (i) => await this.update_message(i, (index) => index + 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('다음 덱 ≫')
      .setCustomId(`Deck_next_${Date.now()}`);

    this.delete = eventHandler
      .register(async (i) => await this._delete(i))
      .setStyle(ButtonStyle.Danger)
      .setLabel('삭제')
      .setCustomId(`Deck_delete_${Date.now()}`);
  }

  /**
   * @param {ButtonInteraction} i
   */
  async open_menu(i) {
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
    await this.update_message(i, (index) => Number(menu.values[0]));
  }

  /**
   * @param {ButtonInteraction} i
   */
  async _delete(i) {
    await i.deferUpdate();
    await decklist._delete_deck(this.decks[this.index], i.guild);
    this.decks.splice(this.index, 1);
    await this.update_message(i, (index) => index + 1);
  }

  build_embed() {
    if (this.decks.length == 0) {
      return new EmbedBuilder()
        .setTitle('❌ 검색 결과가 없습니다.');
    }
    else {
      return decklist.make_deck_embed(this.decks[this.index], this.guild);
    }
  }

  build_actionrow() {
    return new ActionRowBuilder()
      .addComponents(this.prev, this.menu, this.next, this.delete);
  }

  check_range() {
    if (this.decks.length == 0) {
      this.prev.setDisabled(true);
      this.menu.setDisabled(true);
      this.next.setDisabled(true);
      this.delete.setDisabled(true);
    }
    else {
      if (this.index <= 0) this.index = 0;
      this.prev.setDisabled(this.index == 0);
      if (this.index >= this.decks.length - 1) this.index = this.decks.length - 1;
      this.next.setDisabled(this.index == this.decks.length - 1);
    }
  }
}

module.exports = View;
