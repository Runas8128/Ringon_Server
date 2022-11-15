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
const format_console = _label => combine(
  format_base(_label),
  printf(info => colorize({ colors: colorMap })
    .colorize(info.level, `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}`)),
);

const _getLogger = _label => file => winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: format_console,
    }),
    new winston.transports.Http({
      host: 'localhost',
      port: 8080,
      path: '/log',
      format: format_base(_label),
    }),
  ],
});

class Logger {
  constructor() {
    this.root = '';
  }

  /** @param {string} root */
  setRoot = root => this.root = root;

  /** @param {string} file */
  getLogger = file => _getLogger(path.relative(this.root, file));
}

module.exports = new Logger();
