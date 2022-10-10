const { RequestHandler } = require('express');

module.exports = {
  path: '/log',
  methods: ['get', 'post'],

  /** @type {RequestHandler} */
  get: (req, resp) => {
    resp.send(this.log);
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
      const info = JSON.parse(new_log);
      this.log += `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}<br>`;
    });
  },
};
