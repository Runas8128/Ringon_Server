const { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } = require('discord.js');

const { config_common } = require('../../config');
const { decklist } = require('../../database');
const { reply } = require('../../util');
const DecklistView = require('../../View/Decklist');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱검색')
    .setDescription('덱을 검색해줍니다.')
    .addStringOption(option => option
      .setName('검색어')
      .setDescription('검색 대상: 이름, 해시태그')
      .setAutocomplete(true))
    .addUserOption(option => option
      .setName('제작자')
      .setDescription('검색 대상: 제작자'))
    .addStringOption(option => option
      .setName('클래스')
      .setDescription('검색 대상: 클래스')
      .addChoices(...Object.keys(config_common.classes)
        .map(clazz => ({ name: clazz, value: clazz })),
      )),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const keyword = interaction.options.getString('검색어');
    const author = interaction.options.getUser('제작자');
    const clazz = interaction.options.getString('클래스');

    /**
     * @param {import('../../database/decklist').Deck} deck
     * @param {string[]} kws
     */
    function kw_pred(deck, kws) {
      return kws.map((kw) => deck.name.includes(kw) || deck.desc.includes('#' + kw)).length;
    }

    let decks = decklist.decklist;

    if (keyword) {
      const kws = keyword.split(' ');
      decks = decks.sort((d1, d2) => kw_pred(d1, kws) - kw_pred(d2, kws));
      const first_not_match_idx = decks.findIndex(deck => kw_pred(deck, kws) == 0);
      decks.splice(first_not_match_idx);
    }

    if (author) {
      decks = decks.filter(deck => deck.author == author.id);
    }

    if (clazz) {
      decks = decks.filter(deck => deck.clazz == clazz);
    }

    await reply(
      interaction,
      new DecklistView(decks, interaction.guild).get_updated_msg(interaction),
    );
  },
  database: ['decklist'],
  /**
   * @param {AutocompleteInteraction} interaction
   */
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '검색어') return;

    await interaction.respond(
      decklist.decklist
        .filter(deck => deck.name.includes(focusdVar.value))
        .map(deck => ({ name: deck.name, value: deck.name })),
    );
  },
};
