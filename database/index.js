const Detect = require('./detect');
const Decklist = require('./decklist');

class Manager {
  constructor() {
    this.detect = new Detect();
    this.decklist = new Decklist();
  }
}

module.exports = new Manager();
