const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { detect } = require('../../database');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('능지')
    .setDescription('링곤이가 배운 단어들이 몇 개인지 알려줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    interaction.reply(`링곤 사전을 보니, 저의 아이큐는 ${getCount()}이라고 하네요!`);
  },
};

const getCount = () =>
  detect.full.length +
  new Set(detect.prob.map((obj) => obj.target)).size;
