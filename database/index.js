const { ChatInputCommandInteraction } = require('discord.js');
const Detect = require('./detect');
const Decklist = require('./decklist');
const Cards = require('./cards');
const { config_common } = require('../config');
const { catch_timeout } = require('../util');
const logger = require('../util/Logger').getLogger(__filename);

class Manager {
  constructor() {
    this.detect = new Detect();
    this.decklist = new Decklist();
    this.cards = new Cards();

    this.loading = {
      detect: false,
      decklist: false,
      cards: false,
    };
  }

  /**
   * @param {'detect'|'decklist'|'cards'} DB
   */
  async load(DB) {
    if (!Object.keys(this.loading).includes(DB)) return;
    if (this.loading[DB]) {
      logger.warn(`${DB} database is already in loading state, skipping.`);
      return;
    }

    try {
      const sync_start = Date.now();

      logger.info(`Loading ${DB} database`);
      this.loading[DB] = true;

      await this[DB].load();

      const last_sync = Date.now();
      logger.info(`${DB} database load success. time duration: ${last_sync - sync_start}ms`);
    }
    catch (err) {
      logger.error(`An error occured while loading ${DB} database`);
      logger.error(err.stack);
    }
    finally {
      this.loading[DB] = false;
    }
  }
}

module.exports = new Manager();
