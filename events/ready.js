const manager = require('../database');
const logger = require('../util/Logger').getLogger(__filename);

module.exports = {
  name: 'ready',
  once: true,
  async execute() {
    logger.info('Bot is ready!');
  },
};
