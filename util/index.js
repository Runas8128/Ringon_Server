const { RequestTimeoutError, APIResponseError, APIErrorCode } = require('@notionhq/client');
const { ChatInputCommandInteraction, MessagePayload, InteractionReplyOptions } = require('discord.js');

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {string|MessagePayload|InteractionReplyOptions} msg
 */
const reply = (interaction, msg) =>
  interaction[interaction.replied || interaction.deferred ? 'editReply' : 'reply'](msg);

const timer = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { timer, reply };
