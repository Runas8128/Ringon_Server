const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { detect } = require('../../database');
const { reply } = require('../../util');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('능지')
    .setDescription('링곤이가 배운 단어들이 몇 개인지 알려줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const count = detect.full.length + new Set(detect.prob.map((obj) => obj.target)).size;
    const msg = `링곤 사전을 보니, 저의 아이큐는 ${count}이라고 하네요!`;
    await reply(interaction, msg);
  },
};
