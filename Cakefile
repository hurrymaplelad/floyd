_ = require 'underscore'
Rdio = require './rdio'
Dropbox = require './dropbox'

task 'dbox:access', 'get a Drop Box access token', ->
  new Dropbox().launchAccessTokenWizard()

task 'rdio:collection', 'write Rdio albums and one-off tracks to dropbox', ->
  new Rdio().init (rdio) ->
    console.log "listing all albums in #{rdio.user.username}'s Rdio collection" 
    rdio.albums (albums) ->
     
      albumsByArtist = _(albums).groupBy 'artist'
      console.log "found #{albums.length} albums by #{_(albumsByArtist).keys().length} artists"
     
      # Get track-level details for albums that likely only have one track in my collection
      rdio.filterOneOffs albumsByArtist, (oneOffTracks) ->
        console.log "#{oneOffTracks.length} tracks deemed one-offs"

        # write tracks and albums to dropbox
        box = new Dropbox().client
        box.dump 'rdio/albums.json', albumsByArtist
        box.dump 'rdio/oneOffTracks.json', oneOffTracks

task 'rdio:playlists', 'write Rdio playlists to dropbox', ->
  new Rdio().init (rdio) ->
    console.log "listing #{rdio.user.username}'s Rdio playlists" 
    rdio.playlists (playlists) ->
      console.log "found #{playlists.length} playlists"
      box = new Dropbox().client
      box.dump 'rdio/playlists.json', playlists

task 'throw', 'where does the error go?', ->
  throw new Error 'on purpose'