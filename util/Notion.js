const { Client, RequestTimeoutError, APIResponseError, APIErrorCode } = require('@notionhq/client');
const { ChatInputCommandInteraction } = require('discord.js');

function isRetryable(error) {
  return (error instanceof RequestTimeoutError) ||
    (error instanceof APIResponseError && error.code == APIErrorCode.RateLimited);
}

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {() => Promise<any>} callback
 * @param {Number} try_count
 */
async function catch_timeout(interaction, callback, try_count) {
  if (try_count > 5) {
    const msg = {
      content: '재시도 횟수가 5회를 초과했습니다. 요청을 취소합니다.',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) await interaction.editReply(msg);
    else await interaction.reply(msg);
    return;
  }
  try {
    if (try_count === undefined) try_count = 0;
    try_count += 1;
    return await callback();
  }
  catch (err) {
    if (isRetryable(err)) {
      const msg = {
        content: `요청에 실패했습니다. 재시도중... (${try_count} / 5)`,
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) await interaction.editReply(msg);
      else await interaction.reply(msg);

      await (new Promise(resolve => setTimeout(resolve, 100)));
      return await catch_timeout(interaction, callback, try_count);
    }

    throw err;
  }
}

module.exports = {
  notion: new Client({ auth: process.env.notion }),
  catch_timeout: catch_timeout,
};
