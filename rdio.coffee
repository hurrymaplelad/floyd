#
# Chore friendly wrapper around rdio-node
#

_ = require 'underscore'
Driver = require('rdio-node').Rdio
settings = require './settings'

# Rdio's artist key for albums by Various Artists
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
    @driver.makeRequest 'getTracksForArtistInCollection',
      user: @user.key
      artist: VARIOUS_ARTISTS_KEY
      failOnError (tracks) ->
        cb tracks.map (track) ->
          _(track).pick(
            'name'
            'trackNum'
            'artist'
            'artistKey'
            'album'
            'albumKey'
          )

  # modifies the argument map, 
  # returns the filtered out tracks
  filterOneOffs: (albumsByArtist, cb) ->
    questionableAlbums = albumsByArtist['Various Artists']
    console.log "listing track details for #{questionableAlbums.length} potential one-offs"
    @tracksByVariousArtists (tracks) =>
      {wholeAlbums, oneOffTracks} = @collectOneOffs tracks
      albumsByArtist['Various Artists'] = questionableAlbums.filter (album) -> 
        album.albumKey in wholeAlbums
      cb oneOffTracks

  collectOneOffs: (tracks) ->
    wholeAlbums = []
    oneOffTracks = []
    for key, albumTracks of _(tracks).groupBy('albumKey') 
      if albumTracks.length > 2
        wholeAlbums.push key
      else 
        oneOffTracks.push albumTracks

    return {
      wholeAlbums
      oneOffTracks: _(oneOffTracks).flatten()
    }

module.exports = Rdio



