const path = require('path');
const { Client } = require('discord.js');

const { config_common } = require('../config');

/**
 *  @callback EventExecute
 *    @param {...} args
 *
 *  @typedef Event
 *    @property {string} name
 *    @property {boolean} once
 *    @property {EventExecute} execute
 */

/**
 * @param {Client} client
 */
module.exports = (client) => {
  for (const name of config_common.events) {
    /** @type {Event} */
    const event = require(path.join(__dirname, name));
    if (event.once) {
      client.once(event.name, event.execute);
    }
    else {
      client.on(event.name, event.execute);
    }
  }
};
