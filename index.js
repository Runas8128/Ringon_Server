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

console.log(argv);

if (Object.keys(argv).includes('test')) {
  process.env.testing = true;
}

require('./config').init();
require('./app').start();
require('./database').load_all();
