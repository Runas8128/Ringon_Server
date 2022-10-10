require('./config').init();
require('./util/Logger').setRoot(__dirname);
require('./app').start();
