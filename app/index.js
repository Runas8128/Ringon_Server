const path = require('path');
const express = require('express');

const { config_common } = require('../config');
const Logger = require('../util/Logger');
const logger = Logger.getLogger(__filename);

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

class App {
  constructor() {
    this.app = express();
    this.log = '';

    this.load_page();
  }

  load_page() {
    this.app.get('/', (req, resp) => {
      logger.info('GET /');
      resp.sendFile(path.join(__dirname, 'template', 'index.html'));
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
      require('../util/Bot').login();
    });
  }
}

module.exports = new App();
