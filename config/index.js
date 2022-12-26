const path = require('path');

module.exports = {
  init: () => require('dotenv').config({
    path: path.join(
      __dirname, '..', 'env',
      process.env.testing ? 'dev.env' : 'prod.env',
    ),
  }),
  config: process.env.testing ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: require('./config_common.json'),
};
