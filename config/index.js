const config_common = require('./config_common.json');
const logger = require('../util/Logger').getLogger(__filename);

module.exports = {
  init: () => {
    if (config_common.is_testing) {
      logger.info('on development environment');
      logger.info('loading additional dotenv stuffs');
      require('dotenv').config();
    }
    else {
      logger.info('on production environment');
      logger.info('using AWS environment variables');
    }
  },
  config: config_common.is_testing ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: config_common,
};
