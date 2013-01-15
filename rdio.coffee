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
      throw new Error(JSON.stringify(err))
    if response?.status? and response.status isnt 'ok'
      throw new Error(JSON.stringify response)
    cb response?.result ? response

class Rdio

  init: (cb) ->
    @driver = new Driver 
      consumerKey: settings.RDIO_KEY
      consumerSecret: settings.RDIO_SECRET

    if settings.RDIO_ACCESS_TOKEN? and settings.RDIO_ACCESS_SECRET?
      @driver.dataStore_.set 'accessToken'
        oauthAccessToken: settings.RDIO_ACCESS_TOKEN
        oauthAccessTokenSecret: settings.RDIO_ACCESS_SECRET

    @_findUser =>
      cb @

  _findUser: (cb) ->
    @driver.makeRequest 'findUser',
      vanityName: settings.RDIO_USERNAME
      extras: ['username']
      failOnError (result) =>
        @user = result
        cb @user

  cleanAlbum: (album) ->
    _(album).pick(
      'releaseDate'
      'name'
      'artist'
      'artistKey'
      'albumKey'
      'length'
    )        

  albums: (cb) ->
    @driver.makeRequest 'getAlbumsInCollection',
      user: @user.key
      failOnError (albums) =>
        cb albums.map @cleanAlbum

  cleanPlaylist: (playlist) =>
    playlist.tracks = playlist.tracks.map @cleanTrack
    _(playlist).pick(
      'name'
      'key'
      'lastUpdated'
      'tracks'
    )

  playlists: (cb) ->
    @driver.makeRequest 'getUserPlaylists', 
      user: @user.key
      kind: 'owned'
      extras: ['tracks']
      failOnError (playlists) =>
        cb playlists.map @cleanPlaylist

  cleanTrack: (track) ->
    _(track).pick(
      'name'
      'trackNum'
      'artist'
      'artistKey'
      'album'
      'albumKey'
    )

  tracksByVariousArtists: (cb) ->
    @driver.makeRequest 'getTracksForArtistInCollection',
      user: @user.key
      artist: VARIOUS_ARTISTS_KEY
      failOnError (tracks) =>
        cb tracks.map @cleanTrack

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

  searchAlbums: (options, cb) ->
    options.types = 'Album'
    options.count ?= 3
    @driver.makeRequest 'search', options, failOnError (response) =>
      cb response.results

  add: (trackKeys, cb) ->
    @driver.makeRequest 'addToCollection', {keys: trackKeys}, failOnError (response) =>
      cb response

  launchAccessTokenWizard: (cb) ->
    exec = require('child_process').exec
    rl = require('readline').createInterface
      input: process.stdin
      output: process.stdout
    @driver.beginAuthentication failOnError (loginUrl) =>
      console.log "please visit #{loginUrl}"
      exec "open #{loginUrl}"
      rl.question "enter PIN from browser: ", (pin) =>
        rl.close()
        pin = pin.trim()
        @driver.completeAuthentication pin, failOnError =>
          accessToken = @driver.dataStore_.get('accessToken')
          console.log 'authentication successful:'
          console.log "  RDIO_ACCESS_TOKEN: #{accessToken.oauthAccessToken}"
          console.log "  RDIO_ACCESS_SECRET: #{accessToken.oauthAccessTokenSecret}"
          console.log "good till revoked or regenerated"

module.exports = Rdio


