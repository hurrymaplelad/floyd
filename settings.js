const nconf = require('nconf');
const reference = require('./reference.settings');

nconf.env();

try {
  nconf.defaults(require('./local.settings'));
} catch (error1) {
  // ignore
}

// Extract settings to flat object for pretty access
const settings = {};

for (const key in reference) {
  settings[key] = nconf.get(key);
}
