const { Client, RequestTimeoutError, APIResponseError, APIErrorCode } = require('@notionhq/client');
const { ChatInputCommandInteraction, MessagePayload, InteractionReplyOptions } = require('discord.js');

const notion = new Client({ auth: process.env.notion });

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

/**
 *  @typedef RichText
 *    @property {string} plain_text
 *
 *  @typedef {'rich_text' | 'title' | 'number'} PropertyType
 *
 *  @typedef Property
 *    @property {PropertyType} type
 *    @property {RichText[]?} title
 *    @property {RichText[]?} rich_text
 *    @property {number?} number
 *
 *  @param {Property} prop
 *  @returns {string | number}
 */
function unwrap_property(prop) {
  if (prop.type == 'title' || prop.type == 'rich_text') {
    return prop[prop.type][0].plain_text;
  }
  else if (prop.type == 'number') {
    return prop.number;
  }
}

/**
 *  @typedef PropertyDiscriptor
 *    @property {string} name
 *    @property {PropertyType} type
 *
 *  @param {string} database_id
 *  @param {PropertyDiscriptor[]} properties
 *  @returns {Promise<Object[]>}
 */
async function load_all(database_id, ...properties) {
  let pages;
  let start_cursor;
  const data = [];

  do {
    pages = await notion.databases.query({
      database_id: database_id,
      start_cursor: start_cursor,
    });
    pages.results.forEach((result) => {
      const obj = {};

      properties.forEach((property) => {
        obj[property.name] = unwrap_property(result.properties[property.name]);
      });
      data.push(obj);
    });
    start_cursor = pages.next_cursor;
  } while (pages.has_more);

  return data;
}

module.exports = {
  load_all: load_all,
  catch_timeout: catch_timeout,
  reply: reply,
};
