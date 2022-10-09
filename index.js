require('./config').init();

const Logger = require('./util/Logger');
Logger.setRoot(__dirname);

require('./App').start();
