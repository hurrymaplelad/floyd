#
# Chore friendly wrapper around iTunes library files
#

_ = require 'underscore'
plist = require 'plist'
settings = require './settings'

class ITunes

  init: ->
    @library = plist.parseFileSync 'test/fixtures/Library.xml'
    return @

module.exports = ITunes
