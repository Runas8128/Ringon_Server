const Detect = require('./detect');
const Decklist = require('./decklist');
const Cards = require('./cards');
const { catch_timeout } = require('../util');
const { config_common } = require('../config');
const logger = require('../util/Logger').getLogger(__filename);

class Manager {
  constructor() {
    this.detect = new Detect();
    this.decklist = new Decklist();
    this.cards = new Cards();

    this.last_sync = {
      detect: 0,
      decklist: 0,
      cards: 0,
    };
  }

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {('detect'|'decklist'|'cards')[]} DB_names
   */
  async load(interaction, DB_names) {
    if (DB_names === undefined) return;

    DB_names = Array.from(new Set(DB_names));

    await Promise.all(DB_names.map(async (DB) => {
      const sync_start = Date.now();
      if (sync_start - this.last_sync[DB] <= config_common.databases[DB] * 3600000) return;

      let is_success;

      if (interaction.isRepliable()) {
        if (!interaction.deferred) await interaction.deferReply();
        is_success = await catch_timeout(interaction, async () => await this[DB].load());
      }
      else {
        try {
          await this[DB].load();
          is_success = true;
        }
        catch (err) {
          is_success = false;
        }
      }

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
