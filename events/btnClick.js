const { ButtonInteraction, ButtonBuilder } = require('discord.js');

class ClickEventHandler {
  constructor() {
    /**
     *  @callback BtnCallback
     *    @param {ButtonInteraction} interaction
     *    @return {Promise<void>}
     *
     *  @typedef BtnRegisterObj
     *    @property {ButtonBuilder} button
     *    @property {BtnCallback} callback
     */
    /** @type {BtnRegisterObj[]} */
    this.button_map = [];
  }

  /**
   * @param {BtnCallback} callback
   */
  register(callback) {
    const button = new ButtonBuilder();
    this.button_map.push({
      button: button,
      callback: callback,
    });
    return button;
  }
}

const hdr = new ClickEventHandler();

module.exports = {
  name: 'interactionCreate',
  once: false,
  /**
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const button = hdr.button_map.find((obj) => obj.button.data.custom_id === interaction.customId);
    await button.callback(interaction);
  },
  eventHandler: hdr,
};
