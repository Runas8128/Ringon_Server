const fs = require('fs');
const path = require('path');

function is_testing() {
  return fs.existsSync(path.join(__dirname, '..', '.env'));
}

module.exports = {
  init: () => {
    if (is_testing()) {
      console.log('.env detected. loading env vars...');
      require('dotenv').config();
    }
    else {
      console.log('no .env detected. running on production mode');
    }
  },
  config: is_testing() ? require('./config_dev.json') : require('./config_prod.json'),
  config_common: require('./config_common.json'),
};
