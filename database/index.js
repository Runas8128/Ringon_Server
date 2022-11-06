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

    const sync_start = Date.now();

    logger.info(`Loading ${DB} database`);
    this.loading[DB] = true;

    const result = await this[DB].load();
    if (result) {
      const last_sync = Date.now();
      this.last_sync[DB] = last_sync;
      logger.info(`${DB} database syncing success. time duration: ${last_sync - sync_start}ms`);
    }
    else {
      logger.error(`Timeout or Rate limited while syncing ${DB} database`);
    }
    this.loading[DB] = false;
  }
}

module.exports = new Manager();
