const { SlashCommandBuilder, ChatInputCommandInteraction, APIEmbedField } = require('discord.js');

const { detect } = require('../../database');
const { reply } = require('../../util');
const StudiedView = require('../../view/Studied');

module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    /** @type {APIEmbedField[]} */
    const fields = detect.full
      .map(({ target, result }) => ({ name: target, value: result, inline: true }));

    fields.push(
      ...Object.keys(detect.prob)
        .map((target) => ({
          name: target,
          value: detect.prob
            .filter((obj) => obj.target == target)
            .map(({ result, ratio }) => `${result} (가중치: ${ratio})`)
            .join(', '),
          inline: true,
        })),
    );
    await reply(interaction, new StudiedView(
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    ).get_updated_msg());
  },
  database: 'detect',
};
