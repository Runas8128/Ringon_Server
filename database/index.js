const Detect = require('./detect');
const Decklist = require('./decklist');
const Cards = require('./cards');
const { getDuration } = require('../util');
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
      logger.info(`Loading ${DB} database`);
      this.loading[DB] = true;

      const dur = await getDuration(this[DB].load);
      logger.info(`${DB} database load success. time duration: ${dur}ms`);
    }
    catch (err) {
      logger.error(`An error occured while loading ${DB} database`);
      logger.error(err.stack);
    }
    finally {
      this.loading[DB] = false;
    }
  }

  load_all = () => Object.keys(this.loading).forEach(DB => this.load(DB));
}

module.exports = new Manager();
