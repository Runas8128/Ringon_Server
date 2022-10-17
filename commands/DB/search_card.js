const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const { cards } = require('../../database');
const { reply } = require('../../util');

const CardView = require('../../View/Cards');

// TODO: Add Autocomplete

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드검색')
    .setDescription('카드를 검색해옵니다.')
    .addStringOption(option => option.setName('키워드').setDescription('검색할 카드의 키워드입니다.')),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const kw = interaction.options.getString('키워드');
    if (kw === null) {
      await reply(interaction, '검색어를 입력해주세요.');
      return;
    }

    const kws = kw.split(' ');
    /**
     * @param {import('../../database/cards').Card} card
     */
    function kw_pred(card) {
      return kws.filter(word => card.name.includes(word)).length;
    }

    const result = cards.cards.sort((c1, c2) => kw_pred(c1) - kw_pred(c2));
    await reply(
      interaction,
      new CardView(result).get_updated_msg(interaction),
    );
  },
  database: ['cards'],
};
