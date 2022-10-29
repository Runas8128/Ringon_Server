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

    const sync_start = Date.now();
    if (sync_start - this.last_sync[DB] <= config_common.databases[DB] * 3600000 && !force) return;

    if (await loader(() => this[DB].load())) {
      const last_sync = Date.now();
      this.last_sync[DB] = last_sync;
      logger.info(`${DB} database syncing success. time duration: ${last_sync - sync_start}ms`);
    }
    else {
      logger.error(`Timeout or Rate limited while syncing ${DB} database`);
    }
  }
}

module.exports = new Manager();
