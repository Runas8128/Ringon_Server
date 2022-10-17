const { EmbedBuilder, ActionRowBuilder, ButtonInteraction } = require('discord.js');

class View {
  constructor() {
    this.index = 0;
  }

  /**
   *  @callback IndexModifier
   *    @param {number} index
   *    @returns {number}
   *
   * @param {ButtonInteraction} interaction
   * @param {IndexModifier} modify_index
   */
  async update_message(interaction, modify_index) {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }
    this.index = modify_index(this.index);
    await interaction.message.edit(this.get_updated_msg());
  }

  check_range() {
    if (this.index <= 0) this.index = 0;
  }

  build_embed() {
    return new EmbedBuilder();
  }

  build_actionrow() {
    return new ActionRowBuilder();
  }

  get_updated_msg() {
    this.check_range();
    return {
      embeds: [this.build_embed()],
      components: [this.build_actionrow()],
    };
  }
}

module.exports = View;
