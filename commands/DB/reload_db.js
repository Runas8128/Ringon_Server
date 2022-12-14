const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const DBManager = require('../../database');
const { getDuration } = require('../../util');

const noticeEmbed = new EmbedBuilder()
  .setTitle('π DBλ₯Ό μλ°μ΄νΈνλ μ€μλλ€')
  .setDescription('μμ μκ°: ~ 3λΆ');

/** @type {import('..').Command} */
module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('μλ°μ΄νΈ')
    .setDescription('DBλ₯Ό λ€μ λ‘λν©λλ€.')
    .addStringOption(option => option
      .setName('db')
      .setDescription('μλ°μ΄νΈν  DBλ₯Ό μ νν΄μ£ΌμΈμ.')
      .setRequired(true)
      .addChoices(
        { name: 'κ°μ§', value: 'detect' },
        { name: 'λ±λ¦¬', value: 'decklist' },
        { name: 'μΉ΄λ', value: 'cards' },
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
    .setTitle('π DB μλ°μ΄νΈ μλ£!')
    .setDescription(`μμ μκ°: ${duration}μ΄`),
  ],
});
