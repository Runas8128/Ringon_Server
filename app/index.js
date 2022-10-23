const path = require('path');
const express = require('express');

const { config_common } = require('../config');

/**
 *  @typedef Page
 *    @property {string?} path
 *    @property {string[]} methods
 *    @property {express.RequestHandler?} get
 *    @property {express.RequestHandler?} post
 *    @property {express.RequestHandler?} put
 *    @property {express.RequestHandler?} patch
 *    @property {express.RequestHandler?} delete
 */

class App {
  constructor() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, 'static')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));

    this.load_page();
  }

  load_page() {
    for (const page_name of config_common.pages) {
      /** @type {Page} */
      const page = require(path.join(__dirname, 'src', page_name));
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
