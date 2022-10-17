const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('업데이트')
    .setDescription('덱을 간단하게 업데이트해줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply('ping');
  },
  database: ['decklist'],
};
