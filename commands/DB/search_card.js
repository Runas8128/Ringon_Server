const { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } = require('discord.js');

const { kw_pred, sort_filter } = require('../../util');
const { cards } = require('../../database');
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
  execute(interaction) {
    interaction.deferReply()
      .then(() => new CardView(sort_filter(
        cards.cards,
        kw_pred(interaction.options.getString('키워드').split(' ')),
      )))
      .then(result => result.send(interaction));
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
