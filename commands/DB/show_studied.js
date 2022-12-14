const { SlashCommandBuilder, APIEmbedField } = require('discord.js');

const { shrink } = require('../../util');
const { detect } = require('../../database');
const StudiedView = require('../../view/Studied');

/** @type {import('..').Command} */
module.exports = {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  execute(interaction) {
    const fields = detect.full.map(full2Field);
    fields.push(
      ...unique(Object.values(detect.prob).map(({ target }) => target))
        .map(prob2Field));

    if (fields.length == 0) {
      fields.push({ name: '엥 비어있네요', value: '왜지...', inline: true });
    }

    new StudiedView(fields).send(interaction);
  },
};

/** @param {import('../../database/detect').FullDetectObj} @return {APIEmbedField} */
const full2Field = ({ target, result }) => ({
  name: target,
  value: shrink(result, 50),
  inline: true,
});

/** @template T @param {T[]} list @return {T[]} */
const unique = list => [...new Set(list)];

/** @param {string} target */
const formatProb = target => detect.prob
  .filter((obj) => obj.target == target)
  .map(({ result, ratio }) => `${result} (가중치: ${ratio})`)
  .join('\n');

/** @param {string} target @return {APIEmbedField} */
const prob2Field = target => ({
  name: target,
  value: formatProb(target),
  inline: false,
});
