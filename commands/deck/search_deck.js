const { SlashCommandBuilder } = require('discord.js');

const { config_common: { classes } } = require('../../config');
const { kw_pred, sort_filter } = require('../../util');
const { decklist } = require('../../database');
const { Deck } = require('../../database/decklist');
const DecklistView = require('../../view/Decklist');

/** @type {import('..').Command} */
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
      .addChoices(...Object.keys(classes)
        .map(clazz => ({ name: clazz, value: clazz })),
      )),
  execute(interaction) {
    const keyword = interaction.options.getString('검색어');
    const author = interaction.options.getUser('제작자');
    const clazz = interaction.options.getString('클래스');

    /** @type {Deck[]} */
    let decks = JSON.parse(JSON.stringify(decklist.decklist)); // Copy full decklist

    if (keyword) decks = sort_filter(decks, kw_pred(keyword.split(' ')));
    if (author) decks = decks.filter(deck => deck.author == author.id);
    if (clazz) decks = decks.filter(deck => deck.clazz == clazz);

    new DecklistView(decks, interaction.guild).send(interaction);
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '검색어') return;

    await interaction.respond(
      decklist.decklist
        .filter(deck => deck.name.includes(focusdVar.value))
        .slice(0, 25)
        .map(deck => ({ name: deck.name, value: deck.name })),
    );
  },
};
