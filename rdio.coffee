#
# Chore friendly wrapper around rdio-node
#

_ = require 'underscore'
settings = require './settings'

# this URL is registered with our rdio app,
# even though we done't host anything there.
REDIRECT_URI = 'http://localhost:8000/'

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
    @driver = new (require('rdio') {
      rdio:
        clientId: settings.RDIO_ID
        clientSecret: settings.RDIO_SECRET
    })({
      refreshToken: settings.RDIO_REFRESH_TOKEN
    })

    # Short circuit if we need to manually
    # auth the app for a refresh token (see cake rdio:access)
    unless settings.RDIO_REFRESH_TOKEN?
      return cb @

    # flash our long-lived refresh token to get a 12 hour access token.
    # See http://www.rdio.com/developers/docs/web-service/oauth2/quick-ref/ref-token-and-code-expiration
    @driver.getAccessToken {redirect: REDIRECT_URI}, failOnError =>
      # Pre-fetch the user, we need it to do anything interesting
      # and we fail fast if username is misconfigured.
      @_findUser =>
        cb @

  _findUser: (cb) ->
    @driver.request {
      method: 'currentUser'
      extras: ['username']
    }, failOnError (result) =>
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

  PAGE_SIZE: 200
  albums: (cb) ->
    pages = []
    _fetchPageOfAlbums = (pageNum) =>
      @driver.request
        method: 'getAlbumsInCollection'
        user: @user.key
        count: @PAGE_SIZE
        start: pageNum * @PAGE_SIZE
        failOnError (page) =>
          pages.push page
          if page.length >= @PAGE_SIZE
            _fetchPageOfAlbums(pageNum+1)
          else
            cb [].concat(pages...).map @cleanAlbum
    _fetchPageOfAlbums(0)

  cleanPlaylist: (playlist) =>
    playlist.tracks = playlist.tracks.map @cleanTrack
    _(playlist).pick(
      'name'
      'key'
      'lastUpdated'
      'tracks'
    )

  playlists: (cb) ->
    @driver.request
      method: 'getUserPlaylists'
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
    @driver.request
      method: 'getTracksForArtistInCollection'
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
    options.method = 'search'
    @driver.request options, failOnError (response) =>
      cb response.results

  add: (trackKeys, cb) ->
    @driver.request
      method: 'addToCollection'
      keys: trackKeys
      failOnError (response) =>
        cb response

  launchAccessTokenWizard: ->
    exec = require('child_process').exec
    rl = require('readline').createInterface
      input: process.stdin
      output: process.stdout
    authUrl = @driver.oauth.getAuthorizeUrl
      redirect_uri: REDIRECT_URI
      response_type: 'code'

    console.log "please visit #{authUrl} and copy the code the redirected url querystring"
    exec "open '#{authUrl}'"
    rl.question "enter code from browser querystring: ", (code) =>
      rl.close()
      code = code.trim()
      @driver.getAccessToken {code, redirect: REDIRECT_URI}, failOnError =>
        {refreshToken} = @driver.tokens
        console.log 'authentication successful:'
        console.log "  RDIO_REFRESH_TOKEN: #{refreshToken}"
        console.log "good till revoked or regenerated"

module.exports = Rdio


