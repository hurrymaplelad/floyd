_ = require 'underscore'
Rdio = require './rdio'
Dropbox = require './dropbox'
ITunes = require './itunes'
MountainProject = require './mountain_project'
ITunesToRdioMigrator = require './itunes_to_rdio_migrator'
async = require 'async'
github = require './tasks/github'

task 'dbox:access', 'get a Drop Box access token', ->
  new Dropbox().launchAccessTokenWizard()

task 'github:repos', 'archive github repos to dropbox', github.repos

task 'rdio:access', 'get an Rdio access token', ->
  new Rdio().init (rdio) ->
    rdio.launchAccessTokenWizard()

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

task 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "listing Mountain Project user #{mp.id} ticks"
  mp.ticks (ticks) ->
    [tickCount] = ticks.match(/\d+ Ticks for [\w ]+\n/gi) ? []
    console.log "found #{tickCount}"
    box = new Dropbox().client
    box.dump 'mountain-project/ticks.json', ticks

option '-q', '--query [SEARCH]', 'search for this'

task 'rdio:search', '', ({query}) ->
  new Rdio().init (rdio) ->
    rdio.searchAlbums {query, count: 1}, (albums) ->
      console.log albums

task 'itunes:missing', 'find iTunes albums missing from Rdio collection', ->
  iTunes = new ITunes().loadLibrary '/Volumes/Archive/audio/itunes/iTunes Library.xml'
  iTunesAlbumsByArtist = iTunes.albumsByArtist()
  box = new Dropbox().client
  box.parse 'rdio/albums.json', (rdioAlbumsByArtist) ->
    migrator = new ITunesToRdioMigrator {rdioAlbumsByArtist, iTunesAlbumsByArtist}
    incompleteArtists = _(migrator.listIncompleteArtists())
      .filter ({missingTrackCount}) ->
        missingTrackCount > 1

    console.log incompleteArtists.length, 'incomplete artists'
    for {name, rdio, iTunes, missing, missingTrackCount} in incompleteArtists
      console.log name
      console.log '--------------'
      console.log "Rdio", _(rdio).map (a) -> a.name
      console.log "iTunes", _(iTunes).map (a) -> a.name
      console.log "Missing", _(missing).map (a) -> a.name
      console.log "#{missingTrackCount} missing tracks"
      console.log ''

task 'itunes:match', 'add Rdio albums matching missing iTunes albums', ->
  iTunes = new ITunes().loadLibrary '/Volumes/Archive/audio/itunes/iTunes Library.xml'
  iTunesAlbumsByArtist = iTunes.albumsByArtist()
  box = new Dropbox().client
  box.parse 'rdio/albums.json', (rdioAlbumsByArtist) ->
    migrator = new ITunesToRdioMigrator {rdioAlbumsByArtist, iTunesAlbumsByArtist}
    incompleteArtists = _(migrator.listIncompleteArtists())
      .filter ({missingTrackCount}) ->
        missingTrackCount > 1

    console.log incompleteArtists.length, 'artists to match'
    new Rdio().init (rdio) ->
      async.series _(incompleteArtists)
        .chain()
        .map(({missing}) -> missing)
        .flatten()
        .map((album) ->
          (done) ->
            rdio.searchAlbums(
              query: [album.name, album.artist].join ' '
              count: 1
            , (albums) ->
              rdioAlbum = albums[0]
              unless rdioAlbum?
                console.log "No match for #{album.name} by #{album.artist}"
                setTimeout done, 300
              else unless migrator.match {iTunesAlbum: album, rdioAlbum: rdioAlbum}
                console.log "Mismatch for #{album.name} by #{album.artist} (found #{rdioAlbum.name} by #{rdioAlbum.artist})"
                setTimeout done, 300
              else
                console.log "Adding #{rdioAlbum.trackKeys.length} tracks..."
                rdio.add rdioAlbum.trackKeys.join(','), ->
                  console.log "Success! Added #{rdioAlbum.name} by #{rdioAlbum.artist}"
                  setTimeout done, 400
            )
          )
        .value()
      , ->



