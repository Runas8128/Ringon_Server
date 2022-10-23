const { RequestHandler } = require('express');

const log = [];

module.exports = {
  path: '/log',
  methods: ['get', 'post'],

  /** @type {RequestHandler} */
  get: (req, resp) => {
    resp.render('log', { stuffs: log });
  },

  /** @type {RequestHandler} */
  post: (req, resp) => {
    let new_log = '';
    req.on('readable', () => {
      let chunk;

      while ((chunk = req.read()) !== null) {
        new_log += chunk;
      }
    });
    req.on('end', () => {
      log.push(JSON.parse(new_log));
    });
  },
};
