const { SlashCommandBuilder } = require('discord.js');

const { cards } = require('../../database');

/** @type {import('..').Command} */
module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드갯수')
    .setDescription('로드된 카드 갯수를 알려줍니다.'),
  execute(interaction) {
    interaction.reply(`현재 로드된 카드는 총 ${cards.cards.length}개입니다.`);
  },
};
