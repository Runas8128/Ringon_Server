const path = require('path');
const winston = require('winston');
const { combine, timestamp, printf, colorize, label } = winston.format;

const addErrorInfo = winston.format(info =>
  info instanceof Error ?
    Object.assign({}, info, { stack: info.stack, message: info.message }) :
    info);

/** @param {string} _label */
const format_base = _label => combine(
  addErrorInfo(),
  label({ label: _label }),
  timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
);

const colorMap = {
  error: 'bold red',
  warn: 'italic yellow',
  info: 'bold blue',
  debug: 'green',
};

/** @param {string} _label */
const build_console = _label =>
  new winston.transports.Console({
    format: combine(
      format_base(_label),
      printf(info => colorize({ colors: colorMap })
        .colorize(info.level, `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}`)),
    ),
  });

/** @param {string} _label */
const build_http = _label =>
  new winston.transports.Http({
    host: 'localhost',
    port: 8080,
    path: '/log',
    format: format_base(_label),
  });

/** @param {string} _label */
const build_logger = _label =>
  winston.createLogger({
    transports: [
      build_console(_label),
      build_http(_label),
    ],
  });

class Logger {
  /**
   * @param {string} root
   */
  constructor() {
    this.root = '';
  }

  /**
   * @param {string} root
   */
  setRoot = root => this.root = root;

  /**
   * @param {string} file
   */
  getLogger = file => build_logger(path.relative(this.root, file));
}

module.exports = new Logger();
