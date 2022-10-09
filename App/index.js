const path = require('path');
const express = require('express');

const Logger = require('../util/Logger');
const logger = Logger.getLogger(__filename);

class App {
  constructor() {
    this.app = express();
    this.log = '';

    this.app.get('/', (req, resp) => {
      logger.info('GET /');
      resp.sendFile(path.join(__dirname, 'template', 'index.html'));
    });
    this.app.get('/log', (req, resp) => {
      resp.send(this.log);
    });
    this.app.post('/log', (req, resp) => {
      this.append_log(req);
    });
  }

  append_log(req) {
    let new_log = '';
    req.on('readable', () => {
      let chunk;

      while ((chunk = req.read()) !== null) {
        new_log += chunk;
      }
    });
    req.on('end', () => {
      const info = JSON.parse(new_log);
      this.log += `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}<br>`;
    });
  }

  start() {
    this.app.listen(8080, () => {
      console.log('Listening on 8080');
      require('../util/Bot').login();
    });
  }
}

module.exports = new App();
