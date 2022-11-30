const yargs = require('yargs');

const Logger = require('./util/Logger');
Logger.setRoot(__dirname);
const logger = Logger.getLogger(__filename);

process.on('uncaughtException', (error) => {
  logger.error(error.stack);
});

const argv = yargs
  .option('test', {
    desc: 'enable test flag',
    type: 'string',
  })
  .help()
  .argv;

process.env.testing = Object.keys(argv).includes('test');

require('./config').init();
require('./app').start();
require('./database').load_all();
