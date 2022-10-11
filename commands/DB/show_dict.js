const { SlashCommandBuilder, ChatInputCommandInteraction, APIEmbedField } = require('discord.js');

const { detect } = require('../../database');
const { EmbedView } = require('../../util/View');

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
    await interaction.editReply(new EmbedView(
      'Studied_' + Date.now(),
      '감지 키워드 목록입니다!',
      '이 목록에 있는 키워드가 메시지의 내용과 일치하면, 해당 메시지를 보내줍니다.',
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    ).get_updated_msg());
  },
  database: [detect],
};
