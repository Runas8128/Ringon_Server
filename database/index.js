const Detect = require('./detect');
const Decklist = require('./decklist');
const { catch_timeout } = require('../util');
const logger = require('../util/Logger').getLogger(__filename);

class Manager {
  constructor() {
    this.detect = new Detect();
    this.decklist = new Decklist();

    this.last_sync = {
      detect: 0,
      decklist: 0,
    };
  }

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {('detect'|'decklist')[]} DB_names
   */
  async load(interaction, DB_names) {
    if (DB_names === undefined) return;

    await Promise.all(DB_names.map(async (DB) => {
      const sync_start = Date.now();
      if (sync_start - this.last_sync[DB] <= 1 * 60 * 60 * 1000) return;

      if (!interaction.deferred) interaction.deferReply();
      const is_success = await catch_timeout(interaction, async () => await this[DB].load());

      if (is_success) {
        const last_sync = Date.now();
        this.last_sync[DB] = last_sync;
        logger.info(`${DB} database syncing success. time duration: ${last_sync - sync_start}ms`);
      }
      else {
        logger.error(`Timeout or Rate limited while syncing ${DB} database`);
      }
    }));
  }
}

module.exports = new Manager();
