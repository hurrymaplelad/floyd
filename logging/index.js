const winston = require('winston');
const settings = require('../settings');
const {DateTime} = require('luxon');

const {Console} = winston.transports;
const {combine, timestamp, printf, errors} = winston.format;

const DEFAULT_LEVEL = 'info';
const LOG_TIMEZONE = 'America/Los_Angeles';

function getLevel() {
  return settings.LOG_LEVEL ?? DEFAULT_LEVEL;
}

/**
 * Switch timezone for human readability
 */
const getTime = () => {
  return DateTime.now().setZone(LOG_TIMEZONE).toString();
};

const formatLine = printf(
  ({timestamp, label, level, message, ..._extra}) =>
    `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`
);

module.exports = {
  createLogger(label) {
    return winston.createLogger({
      level: getLevel(),
      format: combine(
        timestamp({format: getTime}),
        errors({stack: true}),
        formatLine
      ),
      transports: [new Console()],
      defaultMeta: {label},
    });
  },
};
