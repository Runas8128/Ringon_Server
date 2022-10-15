const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

const { decklist } = require('../../database');
const { DeckListView } = require('../../util/View');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱검색')
    .setDescription('덱을 검색해줍니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const decks = decklist.decklist;

    // TODO: Fill this feature
    await interaction.editReply(
      await new DeckListView({
        customID: 'Decklist_' + Date.now(),
        decks: decks,
      })
        .get_updated_msg(interaction),
    );
  },
  database: ['decklist'],
};
