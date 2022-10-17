const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { cards } = require('../../database');
const { reply } = require('../../util');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드갯수')
    .setDescription('로드된 카드 갯수를 알려줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await reply(interaction, `현재 로드된 카드는 총 ${cards.cards.length}개입니다.`);
  },
  database: ['cards'],
};
