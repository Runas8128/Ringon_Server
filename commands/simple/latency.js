const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('지연시간')
    .setDescription('현재 봇의 레이턴시를 알려드려요!'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    const APIlatency = Math.round(interaction.client.ws.ping);

    interaction.reply(`🏓 현재 레이턴시는 ${APIlatency}ms 입니다!`);
  },
};
