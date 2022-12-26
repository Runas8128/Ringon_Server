const { SlashCommandBuilder } = require('discord.js');

/** @type {import('..').Command} */
module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('종료')
    .setDescription('봇을 강제종료합니다.'),
  execute(interaction) {
    interaction.reply('강제종료중...');
    interaction.client.destroy();
  },
};
