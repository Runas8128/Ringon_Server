const path = require('path');
const express = require('express');

const { config_common } = require('../config');
const manager = require('../database');
const logger = require('../util/Logger').getLogger(__filename);

/**
 *  @typedef Page
 *    @property {string?} path
 *    @property {string[]} methods
 *    @property {import('express').RequestHandler?} get
 *    @property {import('express').RequestHandler?} post
 *    @property {import('express').RequestHandler?} put
 *    @property {import('express').RequestHandler?} patch
 *    @property {import('express').RequestHandler?} delete
 */

function get_state(db_name) {
  if (manager.last_sync[db_name] == 0) {
    return 'not synced';
  }

  if (Date.now() - manager.last_sync > config_common.databases[db_name] * 3600000) {
    return 'outdated';
  }

  return 'OK';
}

/**
 * @param {number} timestamp
 * @param {string} _default
 * @param {string?} postfix
 */
function parse_timestamp(timestamp, _default, postfix) {
  if (timestamp == 0) return _default;
  const target_date = new Date(timestamp);
  let result = target_date.toISOString().split('T').join(' ').slice(0, -1);
  if (postfix) result += postfix;
  return result;
}

function db_sync_data() {
  return Object.keys(manager.last_sync)
    .map(db_name => {
      return {
        name: db_name,
        last_sync: parse_timestamp(manager.last_sync[db_name]),
        state: get_state(db_name),
      };
    });
}

class App {
  constructor() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, 'static')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));

    this.bot = require('../util/Bot');

    this.load_page();
  }

  load_page() {
    this.app.get('/', (req, resp) => {
      logger.info('GET /');
      resp.render('index', { sync_data: db_sync_data() });
    });

    for (const page_name of config_common.pages) {
      /** @type {Page} */
      const page = require(path.join(__dirname, page_name));
      for (const method of page.methods) {
        this.app[method](page.path ?? ('/' + page_name), page[method]);
      }
    }
  }

  start() {
    this.app.listen(8080, () => {
      console.log('Listening on 8080');
      this.bot.login();
    });
  }
}

module.exports = new App();
