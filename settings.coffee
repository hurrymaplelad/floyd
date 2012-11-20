nconf = require 'nconf'
reference = require './reference.settings'

nconf.env()
try
  nconf.defaults(require './local.settings')
catch error
  # ignore

# Extract settings to flat object for pretty access
settings = {}
for key of reference
  settings[key] = nconf.get key

module.exports = settings