const logger = require('../util/Logger').getLogger(__filename);

module.exports = {
  init: () => {
    if (process.env.is_testing) {
      logger.info('on development environment');
      logger.info('loading additional dotenv stuffs');
      require('dotenv').config();
    }
    else {
      logger.info('on production environment');
      logger.info('using AWS environment variables');
    }
  },
  config: process.env.is_testing ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: require('./config_common.json'),
};
