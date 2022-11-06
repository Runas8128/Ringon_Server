require('./config').init();

const Logger = require('./util/Logger');
Logger.setRoot(__dirname);
const logger = Logger.getLogger(__filename);

process.on('uncaughtException', (error) => {
  logger.error(error.stack);
});

require('./app').start();

const DB_Manager = require('./database');
Object.keys(DB_Manager.loading).forEach(DB => DB_Manager.load(DB));
