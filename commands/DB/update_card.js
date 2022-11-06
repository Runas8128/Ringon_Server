const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { cards } = require('../../database');
const logger = require('../../util/Logger').getLogger(__filename);

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('포탈업뎃')
    .setDescription('카드DB를 업데이트합니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply('🔄 카드 DB를 업데이트하는 중입니다.');
    await cards.load();

    try {
      await interaction.editReply('카드 DB 업데이트가 끝났습니다!');
    }
    catch (err) {
      await interaction.channel.send('카드 DB 업데이트가 끝났습니다!');
    }
  },
};
