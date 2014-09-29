#
# Chore friendly wrapper around mountain project
#

_ = require 'underscore'
request = require 'request'
settings = require './settings'

failOnError = (cb) ->
  (err, response, rest...) ->
    if err?
      throw new Error(JSON.stringify(err))
    if response?.status? and response.status isnt 'ok'
      throw new Error(JSON.stringify response)
    cb response?.result ? response, rest...

class MountainProject

  constructor: ->
    @id = settings.MOUNTAIN_PROJECT_ID

  ticks: (done) ->
    request "http://www.mountainproject.com/u/#{@id}?action=ticks&export=1", failOnError (res, body) ->
      done(body)

module.exports = MountainProject
