require('./config').init();

const Logger = require('./util/Logger');
Logger.setRoot(__dirname);
const logger = Logger.getLogger(__filename);

process.on('uncaughtException', (error) => {
  logger.error(error.stack);
});

require('./app').start();
require('./database').load_all();
