const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { decklist } = require('../../database');
const { reply } = require('../../util');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    reply(interaction, {
      embeds: [decklist.analyze(interaction.client)],
    });
  },
};
