const { Client, UnknownHTTPResponseError } = require('@notionhq/client');
const { timer } = require('.');
const logger = require('./Logger').getLogger(__filename);

const notion = new Client({ auth: process.env.notion });

/**
 *  @typedef PropertyPayload
 *    @property {string} name
 *    @property {string|number} value
 *    @property {'title'|'rich_text'|'select'|'number'} type
 *
 *  @param {PropertyPayload} prop
 */
function wrap_property(prop) {
  let obj;
  if (prop.type == 'title' || prop.type == 'rich_text') {
    obj = [ { text: { content: prop.value } } ];
  }
  else if (prop.type == 'select') {
    obj = { name: prop.value };
  }
  else if (prop.type == 'number') {
    obj = prop.value;
  }

  const data = {};
  data[prop.type] = obj;
  return data;
}

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

class Database {
  /**
   * @param {string} database_id
   */
  constructor(database_id) {
    this.database_id = database_id;
  }

  /**
   * @param {PropertyPayload[]} stuffs
   */
  async push(...stuffs) {
    try {
      const properties = {};
      for (const stuff of stuffs) {
        properties[stuff.name] = wrap_property(stuff);
      }

      return notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.database_id,
        },
        properties: properties,
      });
    }
    catch (err) {
      if (err instanceof UnknownHTTPResponseError) {
        logger.warn(
          `Unknown HTTP response error: code ${err.code}, retrying in 100ms`,
        );
        await timer(100);
        this.push(...stuffs);
      }
      else {
        throw err;
      }
    }
  }

  /**
   * @param {string} page_id
   * @param {PropertyPayload[]} stuffs
   */
  async update(page_id, ...stuffs) {
    const properties = {};
    for (const stuff of stuffs) {
      properties[stuff.name] = wrap_property(stuff);
    }

    return notion.pages.update({
      page_id: page_id,
      properties: properties,
    });
  }

  /**
   *  @typedef PropertyDiscriptor
   *    @property {string} name
   *    @property {PropertyType} type
   *
   *  @param {PropertyDiscriptor[]} properties
   *  @returns {Promise<Object[]>}
   */
  async load(...properties) {
    let pages;
    let start_cursor;
    const data = [];

    do {
      pages = await notion.databases.query({
        database_id: this.database_id,
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

  /**
   * @param {string} page_id
   */
  async delete(page_id) {
    try {
      notion.blocks.delete({ block_id: page_id });
    }
    catch (err) {
      if (err instanceof UnknownHTTPResponseError) {
        logger.warn(
          `Unknown HTTP response error: code ${err.code}, retrying in 100ms`,
        );
        await timer(100);
        this.delete(page_id);
      }
      else {
        throw err;
      }
    }
  }

  /**
   * @param {string} page_id
   */
  async drop() {
    /**
     *  @typedef PageObject
     *    @property {string} page_id
     */
    /** @type {PageObject[]} */
    const all_page = await this.load(
      { name: 'page_id', type: 'page_id' },
    );
    for (const page of all_page) {
      this.delete(page.page_id);
    }
  }
}

class Block {
  /**
   * @param {string} block_id
   */
  constructor(block_id) {
    this.block_id = block_id;
  }

  /**
   * @returns {string}
   */
  async get_text() {
    const result = await notion.blocks.retrieve({
      block_id: this.block_id,
    });

    return result.paragraph.rich_text[0].plain_text;
  }

  /**
   * @param {string} new_string
   */
  async update(new_string) {
    notion.blocks.update({
      block_id: this.block_id,
      paragraph: { 'rich_text': [{ 'text': { 'content': new_string } }] },
    });
  }
}

module.exports = {
  Database,
  Block,
};
