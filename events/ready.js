const logger = require('../util/Logger').getLogger(__filename);

module.exports = {
  name: 'ready',
  once: true,
  execute() {
    logger.info('Bot is ready!');
  },
};
