const { RequestHandler } = require('express');

const logger = require('../../util/Logger').getLogger(__filename);

module.exports = {
  path: '/',
  methods: ['get'],

  /** @type {RequestHandler} */
  get: (req, resp) => {
    logger.info('GET /');
    resp.render('index');
  },
};