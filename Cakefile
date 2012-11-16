_ = require 'underscore'
{Rdio} = require 'rdio-node'
Dbox = require 'dbox'
settings = require './settings'

VARIOUS_ARTISTS_KEY = 'rl62|2333316'

rdio = new Rdio
  consumerKey: settings.RDIO_KEY
  consumerSecret: settings.RDIO_SECRET

failOnError = (cb) ->
  (err, response) ->
    if err?
      throw err
    if response.status isnt 'ok'
      throw new Error(JSON.stringify response)
    cb response.result

remember = (f) ->
  result = null
  (cb) ->
    if result?
      cb result
    else
      f (r) ->
        result = r
        cb result 

getUserKey = remember (cb) -> 
  rdio.makeRequest 'findUser',
    vanityName: settings.RDIO_USERNAME
    failOnError (result) ->
      cb result.key 

task 'listAlbums', 'list all albums in Rdio collection', ->
  console.log "listing all albums in #{settings.RDIO_USERNAME}'s Rdio collection" 
  getUserKey (key) ->
    rdio.makeRequest 'getAlbumsInCollection',
      user: key
      failOnError (albums) ->
        albums = albums.map (album) -> 
          _(album).pick(
            'releaseDate'
            'name'
            'artist'
            'artistKey'
            'albumKey'
            'length'
          )

        console.log "received #{albums.length} albums"
        artists = _(albums).groupBy 'artist'

        console.log JSON.stringify artists, null, '  '



    # tracks by various artists
    # rdio.makeRequest 'getTracksForArtistInCollection',
    #   user: key
    #   artist: VARIOUS_ARTISTS_KEY
    #   failOnError (tracks) ->
    #     console.log tracks

    # TODO: group collections with more than 3 tracks back
    #       into albums

