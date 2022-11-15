const path = require('path');
const express = require('express');

const { config_common: { pages } } = require('../config');

class App {
  constructor() {
    this.app = express()
      .use(express.static(path.join(__dirname, 'static')))
      .set('view engine', 'ejs')
      .set('views', path.join(__dirname, 'views'));

    this.load_page();
  }

  load_page = () => pages
    .map(name =>
      ({ name, page: require(path.join(__dirname, 'src', name)) }))
    .forEach(({ name, page }) =>
      page.methods.forEach(method =>
        this.app[method](page.path ?? ('/' + name), page[method])));

  start = () => this.app.listen(8080, () => {
    console.log('Listening on 8080');
    require('../util/Bot').login();
  });
}

module.exports = new App();
