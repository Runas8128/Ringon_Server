const { RequestHandler } = require('express');

const { config_common } = require('../../config');
const manager = require('../../database');
const logger = require('../../util/Logger').getLogger(__filename);

module.exports = {
  path: '/',
  methods: ['get'],

  /** @type {RequestHandler} */
  get: (req, resp) => {
    logger.info('GET /');
    resp.render('index', { sync_data: db_sync_data() });
  },
};

function get_state(db_name) {
  if (manager.last_sync[db_name] == 0) {
    return 'not synced';
  }

  if (Date.now() - manager.last_sync > config_common.databases[db_name] * 3600000) {
    return 'outdated';
  }

  return 'OK';
}

/**
 * @param {number} timestamp
 * @param {string} _default
 */
function parse_timestamp(timestamp, _default) {
  if (timestamp == 0) return _default;
  const target_date = new Date(timestamp + 9 * 60 * 60 * 1000);
  return target_date.toISOString().replace('T', ' ').slice(0, -5);
}

function db_sync_data() {
  return Object.keys(manager.last_sync)
    .map(db_name => {
      return {
        name: db_name,
        last_sync: parse_timestamp(manager.last_sync[db_name]),
        state: get_state(db_name),
      };
    });
}
