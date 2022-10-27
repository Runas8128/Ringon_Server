const config_common = require('./config_common.json');

module.exports = {
  init: () => {
    if (config_common.is_testing) {
      require('dotenv').config();
    }
  },
  config: config_common.is_testing ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: config_common,
};
