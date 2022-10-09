const path = require('path');
const winston = require('winston');
const { combine, timestamp, printf, colorize, label } = winston.format;

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

/**
 * @param {string} _label
 */
function format_base(_label) {
  return combine(
    (winston.format(info => {
      if (info instanceof Error) {
        return Object.assign({}, info, {
          stack: info.stack,
          message: info.message,
        });
      }
      return info;
    }))(),
    label({
      label: _label,
    }),
    timestamp({
      format: 'YY-MM-DD HH:mm:ss',
    }),
  );
}

/**
 * @param {string} _label
 */
function format_console(_label) {
  return combine(
    format_base(_label),
    printf(info => colorize({
      colors: {
        error: 'bold red',
        warn: 'italic yellow',
        info: 'bold blue',
        debug: 'green',
      },
    }).colorize(info.level, `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}`)),
  );
}

class Logger {
  /**
 * @param {string} root
 */
  constructor() {
    this.root = '';
  }

  setRoot(root) {
    this.root = root;
  }

  /**
 * @param {string} file
 */
  getLogger(file) {
    const _label = path.relative(this.root, file);

    return winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: format_console(_label),
        }),
        new winston.transports.Http({
          host: 'localhost',
          port: 8080,
          path: '/log',
          format: format_base(_label),
        }),
      ],
    });
  }
}

module.exports = new Logger();
