(function() {
  var key, nconf, reference, settings;

  nconf = require('nconf');

  reference = require('./reference.settings');

  nconf.env();

  try {
    nconf.defaults(require('./local.settings'));
  } catch (error1) {
    // ignore
  }

  // Extract settings to flat object for pretty access
  settings = {};

  for (key in reference) {
    settings[key] = nconf.get(key);
  }

  module.exports = settings;
}.call(this));
