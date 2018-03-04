#
# Chore friendly wrapper around mountain project
#
fetch = require 'node-fetch'
settings = require './settings'

class MountainProject

  constructor: ->
    @id = settings.MOUNTAIN_PROJECT_ID
    throw new Error("mountian project id required") unless @id

  ticks: ->
    response = await fetch "https://www.mountainproject.com/user/108776141/-/tick-export"
    if !response.ok
      @_fail "#{response.status} #{response.statusText}"
    contentType = response.headers.get('content-type') ? ''
    if !contentType.includes('text/csv')
      @_fail "Unexpected content-type: #{contentType}"

    csv = await response.text()
    tickCount = csv.match(/\d{4}-\d{2}-\d{2},/g)?.length

    if !tickCount
      @_fail "No ticks!"

    return {
      csv: csv
      tickCount: tickCount
    }

  _fail: (message) ->
    throw new Error "[mountainproject] FAILED fetching ticks: #{message}"

module.exports = MountainProject
