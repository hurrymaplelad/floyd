_ = require 'underscore'
Rdio = require './rdio'
Dropbox = require './dropbox'

task 'dbox:access', 'get a Drop Box access token', ->
  new Dropbox().launchAccessTokenWizard()

task 'rdio:albums', 'write Rdio albums and one-off tracks to dropbox', ->
  new Rdio().init (rdio) ->
    console.log "listing all albums in #{rdio.user.username}'s Rdio collection" 
    rdio.albums (albums) ->
      byArtist = _(albums).groupBy 'artist'

      console.log "found #{albums.length} albums by #{_(byArtist).keys().length} artists"
      box = new Dropbox().client
      box.put 'rdio/albums.json', JSON.stringify(byArtist, null, '  '), (status, meta) ->
        console.log "#{status} writing #{meta.bytes} bytes to 'albums.json'"
