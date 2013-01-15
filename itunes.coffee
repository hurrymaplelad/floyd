#
# Chore friendly wrapper around iTunes library files
#

_ = require 'underscore'
plist = require 'plist'
settings = require './settings'

class ITunes
  loadLibrary: (path) ->
    @library = plist.parseFileSync path
    return @

  albumsByArtist: ->
    artists = {}
    for track in @tracks()
      albums = (artists[track.artist] ?= [])
      album = _(albums).find (album) -> album.name is track.album
      if album?
        album.tracks.push track
      else
        albums.push
          name: track.album
          artist: track.artist
          tracks: [track]
    return artists

  tracks: ->
     _(@library.Tracks).chain()
      .values()
      .map((track) ->
        'album': track.Album
        'name': track.Name 
        'artist': track.Artist)
      .value()

module.exports = ITunes
