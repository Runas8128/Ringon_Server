const axios = require('axios');
const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { reply } = require('../../util');

const logger = require('../../util/Logger').getLogger(__filename);

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('포탈링크')
    .setDescription('유효한 덱 코드를 입력하면, 해당 포탈로 가는 링크를 제공합니다!')
    .addStringOption(option =>
      option.setName('덱코드').setDescription('포탈 링크를 만들 덱 코드입니다.').setRequired(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const deck_code = interaction.options.getString('덱코드');

    /**
     *  @typedef Portal
     *    @property {object} data
     *      @property {string} data.hash
     *      @property {any[]} data.errors
     */
    /** @type {Portal} */
    const result = (await axios.get(
      `https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=${deck_code}`)).data;

    if (result.data.errors.length > 0) {
      await reply(
        interaction,
        '덱 코드가 무효하거나, 잘못 입력되었습니다. 다시 입력해 주시기 바랍니다.',
      );
      return;
    }
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('포탈 링크')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://shadowverse-portal.com/deck/${result.data.hash}?lang=ko`),
      );
    await reply(interaction, { components: [row] });
  },
};
