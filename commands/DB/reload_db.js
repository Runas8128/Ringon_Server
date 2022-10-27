const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

const DBManager = require('../../database');
const { catch_timeout } = require('../../util');

// TODO: add autocompleter

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('업데이트')
    .setDescription('DB를 다시 로드합니다.')
    .addStringOption(option => option
      .setName('db')
      .setDescription('업데이트할 DB 이름을 공백으로 구분해주세요.')
      .setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('🔄 DB를 업데이트하는 중입니다')
        .setDescription('예상 시간: ~ 1분')],
    });
    const sync_start = Date.now();
    await DBManager.load(async (loader) => {
      if (!interaction.deferred) await interaction.deferReply();
      return await catch_timeout(interaction, async () => await loader());
    }, interaction.options.getString('db').split(' '), true);
    const sync_end = Date.now();
    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🔄 DB 업데이트 완료!')
        .setDescription(`소요 시간: ${(sync_end - sync_start) / 1000}초`),
      ],
    });
  },
};
