const axios = require('axios');
const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('포탈링크')
    .setDescription('유효한 덱 코드를 입력하면, 해당 포탈로 가는 링크를 제공합니다!')
    .addStringOption(option => option
      .setName('덱코드')
      .setDescription('포탈 링크를 만들 덱 코드입니다.')
      .setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    interaction.deferReply()
      .then(() => axios
        .get(portalURL(interaction.options.getString('덱코드')))
        .then(({ data }) =>
          interaction.reply(buildMsg(data.data))));
  },
};

const portalURL = deck_code =>
  `https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=${deck_code}`;

const deckURL = hash =>
  `https://shadowverse-portal.com/deck/${hash}?lang=ko`;

const buildActionRow = hash =>
  new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('포탈 링크')
        .setStyle(ButtonStyle.Link)
        .setURL(deckURL(hash)),
    );

const buildMsg = ({ errors, hash }) => errors.length ?
  '덱 코드가 무효하거나, 잘못 입력되었습니다. 다시 입력해 주시기 바랍니다.' :
  { components: [buildActionRow(hash)] };
