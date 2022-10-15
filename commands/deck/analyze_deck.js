const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { decklist } = require('../../database');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.editReply({
      embeds: [decklist.analyze()],
    });
  },
  database: ['decklist'],
};
