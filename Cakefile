Dropbox = require './dropbox'
MountainProject = require './mountain_project'
github = require './tasks/github'

# Wrap task to handle async functions
asyncTask = (name, description, fn) ->
  task name, description, ->
    try
      ret = fn()
      if typeof ret?.then == 'function'
        await ret
    catch err
      console.error "[#{name}] Task failed: #{err?.message ? JSON.stringify(err)}"

asyncTask 'github:repos', 'archive github repos to dropbox', github.repos

asyncTask 'mp:ticks', 'write Mountain Project route ticks to dropbox', ->
  mp = new MountainProject()
  console.log "[mountainproject] Listing user #{mp.id} ticks"
  {csv, tickCount} = await mp.ticks()
  console.log "[mountainproject] Found #{tickCount} ticks"
  dropbox = new Dropbox()
  dropbox.uploadString '/mountain-project/ticks.csv', csv
