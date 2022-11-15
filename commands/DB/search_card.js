const { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } = require('discord.js');
const { cards } = require('../../database');
const { Card } = require('../../database/cards');
const { reply } = require('../../util');

const CardView = require('../../view/Cards');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드검색')
    .setDescription('카드를 검색해옵니다.')
    .addStringOption(option => option
      .setName('키워드')
      .setDescription('검색할 카드의 키워드입니다.')
      .setRequired(true)
      .setAutocomplete(true)),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const kws = interaction.options.getString('키워드').split(' ');
    /** @type {Card[]} */
    let list = JSON.parse(JSON.stringify(cards.cards));

    /**
     * @param {Card} card
     */
    const kw_pred = card => kws.filter(word => card.name.includes(word)).length;

    list = list.sort((c1, c2) => kw_pred(c2) - kw_pred(c1));
    const first_not_match_idx = list.findIndex(deck => kw_pred(deck, kws) == 0);
    list.splice(first_not_match_idx);

    reply(
      interaction,
      new CardView(list).get_updated_msg(interaction),
    );
  },
  /**
   * @param {AutocompleteInteraction} interaction
   */
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '키워드') return;

    const result = cards.cards
      .filter(card => card.name.includes(focusdVar.value))
      .slice(0, 25)
      .map(card => ({ name: card.name, value: card.name }));

    if (result.length > 0) {
      await interaction.respond(result);
    }
  },
};
