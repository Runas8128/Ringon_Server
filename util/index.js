const { ChatInputCommandInteraction, MessagePayload, InteractionReplyOptions } = require('discord.js');

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {string|MessagePayload|InteractionReplyOptions} msg
 */
const reply = (interaction, msg) =>
  interaction[interaction.replied || interaction.deferred ? 'editReply' : 'reply'](msg);

const timer = ms => new Promise(resolve => setTimeout(resolve, ms));

const kw_pred = kws => target =>
  kws.filter(word => target.name.includes(word)).length;

/**
 * @param {T[]} list
 * @callback predicate
 *  @param {T} tar
 *  @return {number}
 * @param {predicate} pred
 * @return {T[]}
 */
const sort_filter = (list, pred) => list
  .map(elem => ({ elem: elem, value: pred(elem) }))
  .filter(obj => obj.value != 0)
  .sort((o1, o2) => o2.value - o1.value)
  .map(obj => obj.elem);

const shrink = string => string.length > 100 ?
  string.substring(0, 97) + '...' :
  string;

async function getDuration(callback) {
  const start = Date.now();
  await callback();
  const end = Date.now();
  return end - start;
}

module.exports = { timer, reply, kw_pred, sort_filter, shrink, getDuration };
