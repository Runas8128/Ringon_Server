const manager = require('../database');
const Logger = require('../util/Logger');
const logger = Logger.getLogger(__filename);

module.exports = {
  name: 'ready',
  once: true,
  async execute() {
    logger.info('Loading database stuffs');
    await manager.load_all();
    logger.info('Bot is ready!');
  },
};
