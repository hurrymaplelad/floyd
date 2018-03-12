const nconf = require('nconf');
const reference = require('./reference');

nconf.env();

// Extract settings to flat object for pretty access
const settings = {};

for (const key in reference) {
  settings[key] = nconf.get(key);
}

module.exports = settings;
