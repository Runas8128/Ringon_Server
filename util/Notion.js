const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.notion });

/**
 *  @typedef RichText
 *    @property {string} plain_text
 *
 *  @typedef Select
 *    @property {string} name
 *
 *  @typedef {'rich_text' | 'title' | 'number' | 'select'} PropertyType
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
};
