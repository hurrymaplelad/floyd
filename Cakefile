_ = require 'underscore'
Dropbox = require './dropbox'
ITunes = require './itunes'
MountainProject = require './mountain_project'
async = require 'async'
github = require './tasks/github'

task 'dbox:access', 'get a Drop Box access token', ->
  new Dropbox().launchAccessTokenWizard()

task 'github:repos', 'archive github repos to dropbox', github.repos

task 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "listing Mountain Project user #{mp.id} ticks"
  mp.ticks (ticks) ->
    [tickCount] = ticks.match(/\d+ Ticks for [\w ]+\n/gi) ? []
    console.log "found #{tickCount}"
    box = new Dropbox().client
    box.write 'mountain-project/ticks.html', ticks
