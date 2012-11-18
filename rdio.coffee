#
# Chore friendly wrapper around rdio-node
#

_ = require 'underscore'
Driver = require('rdio-node').Rdio
settings = require './settings'

VARIOUS_ARTISTS_KEY = 'rl62|2333316'

failOnError = (cb) ->
  (err, response) ->
    if err?
      throw err
    if response.status isnt 'ok'
      throw new Error(JSON.stringify response)
    cb response.result

class Rdio

  init: (cb) ->
    @driver = new Driver 
      consumerKey: settings.RDIO_KEY
      consumerSecret: settings.RDIO_SECRET
    @_findUser =>
      cb @

  _findUser: (cb) ->
    @driver.makeRequest 'findUser',
      vanityName: settings.RDIO_USERNAME
      extras: ['username']
      failOnError (result) =>
        @user = result
        cb @user

  albums: (cb) ->
    @driver.makeRequest 'getAlbumsInCollection',
      user: @user.key
      failOnError (albums) ->
        cb albums.map (album) -> 
          _(album).pick(
            'releaseDate'
            'name'
            'artist'
            'artistKey'
            'albumKey'
            'length'
          )

  tracksByVariousArtists: (cb) ->


  # tracks by various artists
  # rdio.makeRequest 'getTracksForArtistInCollection',
  #   user: key
  #   artist: VARIOUS_ARTISTS_KEY
  #   failOnError (tracks) ->
  #     console.log tracks

  # TODO: group collections with more than 3 tracks back
  #       into albums

module.exports = Rdio



