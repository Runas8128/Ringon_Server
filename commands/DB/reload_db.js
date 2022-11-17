const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

const DBManager = require('../../database');

const noticeEmbed = new EmbedBuilder()
  .setTitle('🔄 DB를 업데이트하는 중입니다')
  .setDescription('예상 시간: ~ 3분');

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
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    interaction.reply({ embeds: [noticeEmbed] })
      .then(() => getDuration(interaction.options.getString('db'))
        .then(buildEndEmbed));
  },
};

async function getDuration(db) {
  const sync_start = Date.now();
  await DBManager.load(db);
  const sync_end = Date.now();
  return (sync_end - sync_start) / 1000;
}

const buildEndEmbed = duration => ({
  embeds: [new EmbedBuilder()
    .setTitle('🔄 DB 업데이트 완료!')
    .setDescription(`소요 시간: ${duration}초`),
  ],
});
