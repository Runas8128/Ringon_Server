const { Events } = require('discord.js');
const logger = require('../util/Logger').getLogger(__filename);

/** @type {import('.').Event} */
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute() {
    logger.info('Bot is ready!');
  },
};
