const { RequestTimeoutError, APIResponseError, APIErrorCode } = require('@notionhq/client');
const { ChatInputCommandInteraction, MessagePayload, InteractionReplyOptions } = require('discord.js');

function isRetryable(error) {
  return (error instanceof RequestTimeoutError) ||
    (error instanceof APIResponseError && error.code == APIErrorCode.RateLimited);
}

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {string|MessagePayload|InteractionReplyOptions} msg
 */
async function reply(interaction, msg) {
  if (interaction.replied || interaction.deferred) {
    await interaction.editReply(msg);
  }
  else {
    await interaction.reply(msg);
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {() => Promise<any>} callback
 * @param {Number} try_count
 */
async function catch_timeout(interaction, callback, try_count) {
  if (try_count > 5) {
    return await reply(interaction, {
      content: '재시도 횟수가 5회를 초과했습니다. 요청을 취소합니다.',
      ephemeral: true,
    });
  }
  try {
    try_count = (try_count ?? 0) + 1;
    return await callback();
  }
  catch (err) {
    if (isRetryable(err)) {
      await reply(interaction, {
        content: `요청에 실패했습니다. 재시도중... (${try_count} / 5)`,
        ephemeral: true,
      });

      await timer(100);
      return await catch_timeout(interaction, callback, try_count);
    }

    throw err;
  }
}

function timer(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  catch_timeout: catch_timeout,
  reply: reply,
};
