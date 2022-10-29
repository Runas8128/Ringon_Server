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

    this.last_sync = {
      detect: 0,
      decklist: 0,
      cards: 0,
    };
    this.loading = {
      detect: false,
      decklist: false,
      cards: false,
    };
  }

  general_loader() {
    return async (loader) => {
      try {
        await Promise.race([
          loader(),
          new Promise((resolve, reject) => setTimeout(reject, 2500)),
        ]);
        return true;
      }
      catch (err) {
        logger.info('Rejected but still loading');
        return true;
      }
    };
  }

  /** @param {ChatInputCommandInteraction} interaction */
  command_loader(interaction) {
    return async (loader) => {
      if (!interaction.deferred) await interaction.deferReply();
      return await catch_timeout(interaction, async () => await loader());
    };
  }

  /**
   * @callback Load_Callback
   *  @return {Promise<void>}
   * @callback Loader
   *  @param {Load_Callback} callback
   *  @return {Promise<boolean>}
   * @param {Loader} loader
   * @param {'detect'|'decklist'|'cards'} DB
   * @param {boolean?} force
   */
  async load(loader, DB, force) {
    if (!Object.keys(this.last_sync).includes(DB)) return;
    if (this.loading[DB]) {
      logger.warn(`${DB} database is already in loading state, skipping.`);
      return;
    }

    const sync_start = Date.now();
    if (sync_start - this.last_sync[DB] <= config_common.databases[DB] * 3600000 && !force) return;

    this.loading[DB] = true;
    const result = await loader(async () => await this[DB].load());
    if (result) {
      const last_sync = Date.now();
      this.last_sync[DB] = last_sync;
      logger.info(`${DB} database syncing success. time duration: ${last_sync - sync_start}ms`);
      this.loading[DB] = false;
    }
    else {
      logger.error(`Timeout or Rate limited while syncing ${DB} database`);
      this.loading[DB] = false;
    }
  }
}

module.exports = new Manager();
