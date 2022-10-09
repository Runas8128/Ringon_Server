const Detect = require('./detect');

class Manager {
  constructor() {
    this.detect = new Detect();
  }

  async load_all() {
    await this.detect.load();
  }
}

module.exports = new Manager();
