fs = require 'fs'
childProcess = require 'child_process'
octokit = require '../github'
Dropbox = require '../dropbox'
{GITHUB_USERNAME} = require '../settings'
{promisify} = require 'util'
asyncjs = require 'async'

eachLimit = promisify asyncjs.eachLimit
exec = promisify childProcess.exec
dropbox = new Dropbox()

concatPageData = (method, mapFn = (x) -> x) ->
  response = await method
  data = response.data.map(mapFn)
  while octokit.hasNextPage response
    response = await octokit.getNextPage response
    data = data.concat response.data.map(mapFn)
  return data

stars = ->
  console.log "[github] Listing #{GITHUB_USERNAME}'s starred repos"
  starredRepos = await concatPageData(
    octokit.activity.getStarredRepos
      page: 0
      per_page: 75 # bump up the default to consume less of our quota
    (response) ->
      # the first page has starred_at, the rest don't >:(
      repo = response.repo ? response
      return
        full_name: repo.full_name
        description: repo.description
        updated_at: repo.updated_at
        stargazers_count: repo.stargazers_count
        language: repo.language
  )
  console.log "[github] Found #{starredRepos.length} stars"

  await dropbox.uploadString '/github/stars.json',
    JSON.stringify starredRepos, null, 2

repos = ->
  console.log "[github] Archiving all #{GITHUB_USERNAME}'s public github repos"

  maxConcurrentUploads = 5

  repos = await concatPageData octokit.repos.getForUser
    username: GITHUB_USERNAME
    type: 'owner'
    per_page: 75 # bump up the default to consume less of our quota

  repos = repos.filter (repo) -> not repo.fork
  console.log "[github] Found #{repos.length} repos"

  await eachLimit repos, maxConcurrentUploads, (repo) ->
    try
      await archiveRepo repo
    catch err
      console.error "[#{repo.full_name}] BACKUP FAILED"
      console.error "[#{repo.full_name}] #{err?.message ? JSON.stringify(err)}"

  console.log "[github] Done archiving repos"

archiveRepo = (repo) ->
  console.log "[#{repo.full_name}] Archiving (#{repo.size}K)"

  repoDir = "/github/#{GITHUB_USERNAME}/#{repo.name}"
  archivePath = "#{repoDir}/#{repo.name}.tar.gz"

  # Check if repo has changed since last backup
  meta = await dropbox.getMetadata archivePath
  if meta?.server_modified \
     and (not meta.is_deleted) \
     and (new Date(meta.server_modified) >= new Date(repo.updated_at))
    console.log "[#{repo.full_name}] Skipping. Unchanged since #{new Date(repo.updated_at)})"
    return

  await dropbox.uploadString "#{repoDir}/github_meta.json",
    JSON.stringify repo, null, 2

  # pre clean in case we have stale file from previous run
  await exec "rm -rf temp/#{repo.full_name} temp/#{repo.full_name}.tar.gz"
  await exec "mkdir -p #{repo.full_name}"
  await exec "git clone #{repo.clone_url} temp/#{repo.full_name}"
  console.log "[#{repo.full_name}] Tarballing"
  await exec "tar -czf #{repo.name}.tar.gz #{repo.name}", cwd: "temp/#{repo.owner.login}"

  archiveStream = fs.createReadStream "temp/#{repo.full_name}.tar.gz"
  console.log "[#{repo.full_name}] Starting upload"
  await dropbox.uploadStream archivePath, archiveStream

  console.log "[#{repo.full_name}] Cleaning up"
  await exec "rm -rf temp/#{repo.full_name} temp/#{repo.full_name}.tar.gz"

module.exports = {repos, stars}
