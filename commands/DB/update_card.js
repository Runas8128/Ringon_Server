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
    // TODO: Fill this feature
    const start_time = Date.now();
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔄 카드 DB를 업데이트하는 중입니다.')
          .setDescription('예상 시간: 약 10~20초')
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
