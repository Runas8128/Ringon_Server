const { SlashCommandBuilder, ChatInputCommandInteraction: Interaction, EmbedBuilder } = require('discord.js');

const { config_common: { classes } } = require('../../config');
const { decklist } = require('../../database');
const { reply } = require('../../util');

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

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  /**
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const total_count = decklist.decklist.length;
    const getShare = shareFactory(total_count);

    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    Object
      .entries(classes)
      .forEach(([ clazz, emoji ]) => {
        const count = getClassCount(clazz);
        const class_emoji = emojiCache(interaction).find(({ id }) => id == emoji);

        embed.addFields({
          name: `${class_emoji} ${clazz}`,
          value: `${count}개 (점유율: ${getShare(count)}%)`,
          inline: true,
        });
      });

    reply(interaction, { embeds: [ embed ] });
  },
};
