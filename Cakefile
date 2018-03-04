_ = require 'underscore'
Dropbox = require './dropbox'
ITunes = require './itunes'
MountainProject = require './mountain_project'
async = require 'async'
github = require './tasks/github'

task 'github:repos', 'archive github repos to dropbox', github.repos

task 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "[mountainproject] Listing user #{mp.id} ticks"
  {csv, tickCount} = await mp.ticks()
  console.log "[mountainproject] Found #{tickCount} ticks"
  dropbox = new Dropbox()
  dropbox.uploadString '/mountain-project/ticks.csv', csv
