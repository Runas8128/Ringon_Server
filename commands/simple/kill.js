const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('종료')
    .setDescription('봇을 강제종료합니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply('강제종료중...');
    interaction.client.destroy();
  },
};
