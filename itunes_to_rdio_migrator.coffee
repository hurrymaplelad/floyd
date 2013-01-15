_ = require 'underscore'
settings = require './settings'

class ITunesToRdioMigrator
  constructor: ({@iTunesAlbumsByArtist, @rdioAlbumsByArtist}) ->
    # redindex albums by simplified artist name
    @iTunesAlbumsByArtist = @cleanReindex @iTunesAlbumsByArtist
    @rdioAlbumsByArtist = @cleanReindex @rdioAlbumsByArtist

  clean: (string) ->
    (string ? '')
      .toLowerCase()
      .replace(/[-'":.]/g, '')
      .replace(/\(.*\)/g, '')
      .trim()
      .replace(/ep$/i, '')

  cleanReindex: (map) ->
    result = {}
    for key, values of map
      cleanedKey = @clean key
      result[cleanedKey] ?= []
      result[cleanedKey] = result[cleanedKey].concat values
    return result

  listIncompleteArtists: ->
    incompleteArtists = []
    for artist, albums of @iTunesAlbumsByArtist
      rdioAlbums = @rdioAlbumsByArtist[artist] ? []
      albumNames = _(albums).map (a) => @clean a.name
      rdioAlbumNames = _(rdioAlbums).map (a) => @clean a.name
      if (missingNames = _(albumNames).difference(rdioAlbumNames)).length
        missing = _(missingNames).map (albumName) =>
          _(albums).find (album) => @clean(album.name) is albumName
        missingTrackCount = _(missing).chain()
          .pluck('tracks')
          .flatten()
          .value().length
        incompleteArtists.push {
          name: artist
          rdio: rdioAlbums
          iTunes: albums
          missing: missing
          missingTrackCount: missingTrackCount
        } 
    return incompleteArtists

  match: ({iTunesAlbum, rdioAlbum}) ->
    @clean(rdioAlbum.name).indexOf(@clean(iTunesAlbum.name)) >= 0 and
    @clean(rdioAlbum.artist).indexOf(@clean(iTunesAlbum.artist)) >= 0

module.exports = ITunesToRdioMigrator