const { notion } = require('../util/Notion');

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

async function _load(database_id, ...properties) {
  let pages = undefined;
  let start_cursor = undefined;
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
  _load: _load,
};
