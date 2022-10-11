const Detect = require('./detect');
const Decklist = require('./decklist');

class Manager {
  constructor() {
    this.detect = new Detect();
    this.decklist = new Decklist();
  }

  async load_all() {
    await this.detect.load();
    await this.decklist.load();
  }
}

module.exports = new Manager();
