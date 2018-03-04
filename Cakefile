Dropbox = require './dropbox'
MountainProject = require './mountain_project'
github = require './tasks/github'

# Wrap task to handle async functions
asyncTask = (name, description, fn) ->
  task name, description, ->
    try
      ret = fn(...arguments)
      if typeof ret?.then == 'function'
        await ret
    catch err
      console.error "[#{name}] Task failed: #{err?.message ? JSON.stringify(err)}"
      if err?.stack
        console.error err?.stack

asyncTask 'github:stars', 'save list of starred github repos to dropbox', github.stars

asyncTask 'github:repos', 'archive github repos to dropbox', github.repos

option '-r', '--repo [NAME]', 'the full name of a repo to backup. ex: hmlad/example'
asyncTask 'github:repo', 'archive a single github repo to dropbox', github.repo

asyncTask 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "[mountainproject] Listing user #{mp.id} ticks"
  {csv, tickCount} = await mp.ticks()
  console.log "[mountainproject] Found #{tickCount} ticks"
  dropbox = new Dropbox()
  dropbox.uploadString '/mountain-project/ticks.csv', csv
