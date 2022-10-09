const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드검색')
    .setDescription('카드를 검색해옵니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    // TODO: Fill this feature
  },
};
