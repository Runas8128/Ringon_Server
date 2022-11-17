const { SlashCommandBuilder, ChatInputCommandInteraction: Interaction, EmbedBuilder } = require('discord.js');

const { config_common: { classes } } = require('../../config');
const { decklist } = require('../../database');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  /**
   * @param {Interaction} interaction
   */
  execute(interaction) {
    interaction.reply({
      embeds: [buildEmbed(decklist.decklist.length, emojiCache(interaction))],
    });
  },
};

/** @param {string} clazz */
const getClassCount = clazz =>
  decklist.decklist.filter((deck) => deck.clazz == clazz).length;

/** @param {number} total_count */
const shareFactory = total_count =>
  /** @param {number} count */
  count =>
    (count / total_count * 100).toPrecision(4);

/** @param {Interaction} interaction */
const emojiCache = interaction =>
  interaction.client.emojis.cache;

function getField(clazz, emoji, getShare) {
  const count = getClassCount(clazz);
  const class_emoji = emoji.find(({ id }) => id == classes[clazz]);

  return {
    name: `${class_emoji} ${clazz}`,
    value: `${count}개 (점유율: ${getShare(count)}%)`,
    inline: true,
  };
}

const buildEmbed = (total_count, emoji) =>
  new EmbedBuilder()
    .setTitle(`총 ${total_count}개 덱 분석 결과`)
    .addFields(...Object
      .keys(classes)
      .map(clazz => getField(clazz, emoji, shareFactory(total_count))),
    );
