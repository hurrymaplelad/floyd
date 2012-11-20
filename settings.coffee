nconf = require 'nconf'
reference = require './reference.settings'

nconf.env()
try
  nconf.defaults(require './local.settings')
catch error
  throw error unless error.code is 'MODULE_NOT_FOUND'

# Extract settings to flat object for pretty access
settings = {}
for key of reference
  settings[key] = nconf.get key

module.exports = settings