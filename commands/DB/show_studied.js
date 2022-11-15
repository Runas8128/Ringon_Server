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
      .map(({ target, result }) => ({
        name: target,
        value: result.length > 50 ?
          result.substring(0, 47) + '...' :
          result,
        inline: true,
      }));

    const probIndex = [...new Set(
      Object.keys(detect.prob)
        .map(index => detect.prob[parseInt(index)].target),
    )];

    fields.push(
      ...probIndex
        .map(target => ({
          name: target,
          value: detect.prob
            .filter((obj) => obj.target == target)
            .map(({ result, ratio }) => `${result} (가중치: ${ratio})`)
            .join('\n'),
          inline: false,
        })),
    );
    interaction.reply(new StudiedView(
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    ).get_updated_msg());
  },
};
