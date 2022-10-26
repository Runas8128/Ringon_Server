const path = require('path');

const config_common = require('./config_common.json');

module.exports = {
  init: () => {
    require('dotenv').config({
      path: path.join(
        __dirname, '..', 'env',
        config_common.is_testing ? 'dev.env' : 'prod.env',
      ),
    });
  },
  config: config_common.is_testing ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: config_common,
};
