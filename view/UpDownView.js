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
  update_message(interaction, modify_index) {
    this.index = modify_index(this.index);
    interaction.message.edit(this.get_updated_msg());
  }

  check_range() {
    if (this.index <= 0) this.index = 0;
  }

  build_embed = () => new EmbedBuilder();
  build_actionrow = () => new ActionRowBuilder();

  get_updated_msg() {
    this.check_range();
    return {
      embeds: [this.build_embed()],
      components: [this.build_actionrow()],
    };
  }
}

module.exports = View;
