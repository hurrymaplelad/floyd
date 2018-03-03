_ = require 'underscore'
Dropbox = require './dropbox'
ITunes = require './itunes'
MountainProject = require './mountain_project'
async = require 'async'
github = require './tasks/github'

task 'github:repos', 'archive github repos to dropbox', github.repos

task 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "listing Mountain Project user #{mp.id} ticks"
  mp.ticks (ticks) ->
    [tickCount] = ticks.match(/\d+ Ticks for [\w ]+\n/gi) ? []
    console.log "found #{tickCount}"
    dropbox = new Dropbox()
    dropbox.uploadString 'mountain-project/ticks.html', ticks
