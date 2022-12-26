const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const DBManager = require('../../database');
const { getDuration } = require('../../util');

const noticeEmbed = new EmbedBuilder()
  .setTitle('🔄 DB를 업데이트하는 중입니다')
  .setDescription('예상 시간: ~ 3분');

/** @type {import('..').Command} */
module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('업데이트')
    .setDescription('DB를 다시 로드합니다.')
    .addStringOption(option => option
      .setName('db')
      .setDescription('업데이트할 DB를 선택해주세요.')
      .setRequired(true)
      .addChoices(
        { name: '감지', value: 'detect' },
        { name: '덱리', value: 'decklist' },
        { name: '카드', value: 'cards' },
      )),
  execute(interaction) {
    const DB = interaction.options.getString('db');

    interaction.reply({ embeds: [noticeEmbed] })
      .then(() => getDuration(() => DBManager.load(DB)))
      .then(duration => interaction.editReply(buildEndEmbed(duration)));
  },
};

const buildEndEmbed = duration => ({
  embeds: [new EmbedBuilder()
    .setTitle('🔄 DB 업데이트 완료!')
    .setDescription(`소요 시간: ${duration}초`),
  ],
});
