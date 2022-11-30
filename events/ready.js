const { Events } = require('discord.js');
const logger = require('../util/Logger').getLogger(__filename);

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute() {
    logger.info('Bot is ready!');
  },
};
