const LogLevels = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  parse(input) {
    return LogLevels[input?.toLowerCase()];
  },
};

module.exports = LogLevels;
