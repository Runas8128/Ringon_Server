const { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } = require('discord.js');
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
  async execute(interaction) {
    await interaction.deferReply();
    const kws = interaction.options.getString('키워드').split(' ');

    interaction.reply(
      new CardView(sort_filter(cards.cards, kw_pred(kws)))
        .get_updated_msg(interaction),
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

const kw_pred = kws => card =>
  kws.filter(word => card.name.includes(word)).length;

/**
 * @param {T[]} list
 * @callback predicate
 *  @param {T} tar
 *  @return {number}
 * @param {predicate} pred
 * @return {T[]}
 */
const sort_filter = (list, pred) => list
  .map(elem => ({ elem: elem, value: pred(elem) }))
  .filter(obj => obj.value != 0)
  .sort((o1, o2) => o2.value - o1.value)
  .map(obj => obj.elem);
