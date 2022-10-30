const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const { cards } = require('../../database');
const { reply } = require('../../util');
const logger = require('../../util/Logger').getLogger(__filename);

module.exports = {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('포탈업뎃')
    .setDescription('카드DB를 업데이트합니다.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const start_time = Date.now();
    const base = new EmbedBuilder()
      .setTitle('🔄 카드 DB 업데이트')
      .setTimestamp(start_time);

    for await (const { msg, time } of cards.update()) {
      logger.info(msg);
      const dur = (time - start_time) / 1000;
      const min = Math.floor(dur / 60);
      const sec = Math.floor(dur - min * 60);
      const embed = EmbedBuilder
        .from(base.data)
        .addFields({
          name: msg,
          value: `시간 경과: ${min}:${sec}`,
        });
      await reply(interaction, { embeds: [embed] });
    }
  },
};
