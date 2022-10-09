const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('팩이름')
    .setDescription('현재 팩 이름을 변경합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('새로운 팩의 이름입니다.').setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    // TODO: Fill this feature
  },
};
