const logger = require('../util/Logger').getLogger(__filename);

/** @type {import('.').Event} */
module.exports = {
  name: 'ready',
  once: true,
  execute() {
    logger.info('Bot is ready!');
  },
};
