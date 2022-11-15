const path = require('path');
const { Client } = require('discord.js');

const { config_common: { events } } = require('../config');

/**
 *  @callback EventExecute
 *    @param {...} args
 *
 *  @typedef Event
 *    @property {string} name
 *    @property {boolean} once
 *    @property {EventExecute} execute
 */

/** @param {Client} client */
module.exports = (client) => events.forEach(event => {
  /** @type {Event} */
  const { once, name, execute } = require(path.join(__dirname, event));
  client[once ? 'once' : 'on'](name, execute);
});
