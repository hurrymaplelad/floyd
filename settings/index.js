const nconf = require('nconf');
const reference = require('./reference');
const LogLevels = require('./log_levels');

nconf.env();

// Extract settings to flat object for pretty access
const settings = {};

for (const key in reference) {
  settings[key] = nconf.get(key);
}

module.exports = {
  ...settings,
  LOG_LEVEL: LogLevels.parse(nconf.get('LOG_LEVEL')) ?? LogLevels.warn,
};
