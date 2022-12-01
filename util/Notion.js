const { Client, UnknownHTTPResponseError } = require('@notionhq/client');
const { timer } = require('.');
const logger = require('./Logger').getLogger(__filename);

/** @typedef {'title'|'rich_text'|'select'|'number'|'page_id'} PropertyType */

/**
 *  @typedef PropertyPayload
 *    @property {string} name
 *    @property {string|number} value
 *    @property {PropertyType} type
 */

const notion = new Client({ auth: process.env.notion });

const wrapper = {
  'title': prop => [{ text: { content: prop.value } }],
  'rich_text': prop => [{ text: { content: prop.value } }],
  'select': prop => ({ name: prop.value }),
  'number': prop => prop.value,
};

const wrap_property = prop => ({ [prop.type]: wrapper[prop.type]?.(prop) });

const unwrapper = {
  'title': prop => prop.title[0].plain_text,
  'rich_text': prop => prop.rich_text[0].plain_text,
  'number': prop => prop.number,
  'select': prop => prop.select.name,
};

const unwrap_property = prop => unwrapper[prop.type]?.(prop);

class Database {
  /**
   * @param {string} database_id
   */
  constructor(database_id) {
    this.database_id = database_id;
  }

  /**
   * @param {PropertyPayload} stuffs
   */
  push(...stuffs) {
    try {
      return notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.database_id,
        },
        properties: stuffs
          .reduce((prev, curr) => ({ ...prev, [curr.name]: wrap_property(curr) })),
      });
    }
    catch (err) {
      if (!(err instanceof UnknownHTTPResponseError)) throw err;

      logger.warn(
        `Unknown HTTP response error: code ${err.code}, retrying in 100ms`,
      );
      timer(100).then(() => this.push(...stuffs));
    }
  }

  /**
   * @param {string} page_id
   * @param {PropertyPayload} stuffs
   */
  update = (page_id, ...stuffs) =>
    notion.pages.update({
      page_id: page_id,
      properties: stuffs
        .reduce((prev, curr) => ({ ...prev, [curr.name]: wrap_property(curr) })),
    });

  /**
   *  @typedef PropertyDescriptor
   *    @property {string} name
   *    @property {PropertyType} type
   */
  /**
   *  @param {PropertyDescriptor} properties
   *  @returns {Promise<Object[]>}
   */
  async load(...properties) {
    let pages;
    let start_cursor = undefined;
    const data = [];

    do {
      pages = await notion.databases.query({
        database_id: this.database_id,
        start_cursor: start_cursor,
      });

      pages.results
        .forEach(result => data.push(
          properties
            .reduce((prev, { name, type }) => ({
              ...prev,
              [name]: type === 'page_id' ?
                result.id :
                unwrap_property(result.properties[name]),
            })),
        ));
      start_cursor = pages.next_cursor;
    } while (pages.has_more);

    return data;
  }

  /**
   * @param {string} page_id
   */
  delete(page_id) {
    try {
      notion.blocks.delete({ block_id: page_id });
    }
    catch (err) {
      if (!(err instanceof UnknownHTTPResponseError)) throw err;

      logger.warn(`Unknown HTTP response error: code ${err.code}, retrying in 100ms`);
      timer(100).then(() => this.delete(page_id));
    }
  }

  /**
   * @param {string} page_id
   */
  drop = () => this
    .load({ name: 'page_id', type: 'page_id' })
    .then(pages => pages.forEach(({ page_id }) => this.delete(page_id)));
}

class Block {
  /**
   * @param {string} block_id
   */
  constructor(block_id) {
    this.block_id = block_id;
  }

  /**
   * @returns {Promise<string>}
   */
  get_text = () =>
    notion.blocks.retrieve({ block_id: this.block_id })
      .then(result => result.paragraph.rich_text[0].plain_text);

  /**
   * @param {string} new_string
   */
  update = new_string => notion.blocks.update({
    block_id: this.block_id,
    paragraph: { 'rich_text': [{ 'text': { 'content': new_string } }] },
  });
}

module.exports = {
  Database,
  Block,
};
