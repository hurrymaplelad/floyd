const nconf = require('nconf');
const reference = require('./reference');

nconf.env();

try {
  nconf.defaults(require('./local'));
} catch (error) {
  // ignore
}

// Extract settings to flat object for pretty access
const settings = {};

for (const key in reference) {
  settings[key] = nconf.get(key);
}

module.exports = settings;
