fs = require 'fs'
{exec} = require 'child_process'
Github = require 'github'
Dropbox = require '../dropbox'
{eachLimit, series} = require 'async'
{GITHUB_USERNAME} = require '../settings'

github = new Github(version: '3.0.0')

failOnError = (cb) ->
  (err, data) ->
    if err?
      throw new Error(err)
    cb data

repos = ->
  console.log "Archiving all #{GITHUB_USERNAME}'s public github repos"

  maxPageSize = 90
  maxSimultaneousCheckouts = 1

  github.repos.getFromUser
    user: GITHUB_USERNAME
    type: 'owner'
    per_page: maxPageSize
    failOnError (repos) =>
      if repos.length >= maxPageSize
        throw new Error('Too many github repos.  Time to start paging')

      repos = repos.filter (repo) -> not repo.fork
      console.log "Found #{repos.length} repos"

      eachLimit repos, maxSimultaneousCheckouts, archiveRepo, failOnError ->
        console.log "Done archiving repos"

archiveRepo = (repo, done) ->
  {name, clone_url, size} = repo
  console.log "Archiving #{name} (#{size}K)"

  if size > 10000
    throw new Error "Repo #{name} is too big to archive in memory."

  # Check if repo has changed since last backup
  box = new Dropbox().client
  box.metadata "github/#{name}.tar.gz", (err, meta) ->
    if meta?.modified and (not meta.is_deleted) and (new Date(meta.modified) >= new Date(repo.updated_at))
      console.log "Skipping, unchanged"
      done()
    else
      series [
        (next) ->
          # pre clean in case we have stale file from previous run
          exec "rm -rf temp/#{name} temp/#{name}.tar.gz", next
        (next) ->
          exec "git clone #{clone_url} temp/#{name}", next
        (next) ->
          exec "tar -czf #{name}.tar.gz #{name}", cwd: 'temp', next
        (next) ->
          box.put(
            "github/#{name}.tar.gz",
            fs.readFileSync("temp/#{name}.tar.gz"),
            ->
              next()
          )
        (next) ->
          exec "rm -rf temp/#{name} temp/#{name}.tar.gz", next
      ], done

module.exports = {repos}

