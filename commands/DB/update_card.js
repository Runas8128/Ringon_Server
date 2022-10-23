const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { cards } = require('../../database');

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('포탈업뎃')
    .setDescription('카드DB를 업데이트합니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const start_time = Date.now();
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔄 카드 DB를 업데이트하는 중입니다. (예상 시간: 약 20~40초)')
          .setDescription('카드 관련 제외 다른 명령어를 사용할 수 있습니다.')
          .setTimestamp(start_time),
      ],
    });
    const card_count = await cards.update();
    const end_time = Date.now();
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('카드 DB 업데이트에 성공했습니다!')
          .setDescription(
            `걸린 시간: ${(end_time - start_time) / 1000}초 / ` +
            `총 카드 수: ${card_count}개`,
          ).setTimestamp(end_time),
      ],
    });
  },
};
