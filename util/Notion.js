const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.notion });

/**
 *  @typedef RichText
 *    @property {string} plain_text
 *
 *  @typedef Select
 *    @property {string} name
 *
 *  @typedef {'page_id' | 'rich_text' | 'title' | 'number' | 'select'} PropertyType
 *
 *  @typedef Property
 *    @property {PropertyType} type
 *    @property {RichText[]?} title
 *    @property {RichText[]?} rich_text
 *    @property {number?} number
 *    @property {Select?} select
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
  else if (prop.type == 'select') {
    return prop.select.name;
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
        if (property.type == 'page_id') {
          obj[property.name] = result.id;
        }
        else {
          obj[property.name] = unwrap_property(result.properties[property.name]);
        }
      });
      data.push(obj);
    });
    start_cursor = pages.next_cursor;
  } while (pages.has_more);

  return data;
}

async function load_block_string(block_id) {
  const result = await notion.blocks.retrieve({
    block_id: block_id,
  });

  return result.paragraph.rich_text[0].plain_text;
}

async function update_block_string(block_id, new_string) {
  await notion.blocks.update({
    block_id: block_id,
    paragraph: { 'rich_text': [{ 'text': { 'content': new_string } }] },
  });
}

module.exports = {
  load_all: load_all,
  load_block_string: load_block_string,
  update_block_string: update_block_string,
};
