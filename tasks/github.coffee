fs = require 'fs'
octokit = require '../github'
Dropbox = require '../dropbox'
{GITHUB_USERNAME} = require '../settings'
{promisify} = require 'util'
asyncjs = require 'async'

eachLimit = promisify asyncjs.eachLimit
dropbox = new Dropbox()

archiveRepo = (repo) ->
  console.log "[#{repo.full_name}] Archiving (#{repo.size}K)"

  repoDir = "/github/#{repo.full_name}"
  archivePath = "#{repoDir}/#{repo.name}.tar.gz"

  # Check if repo has changed since last backup
  meta = await dropbox.getMetadata archivePath
  if meta?.server_modified \
     and (not meta.is_deleted) \
     and (new Date(meta.server_modified) >= new Date(repo.pushed_at))
    console.log "[#{repo.full_name}] Skipping. Unchanged since #{new Date(repo.pushed_at)})"
    return

  await dropbox.uploadString "#{repoDir}/github_meta.json",
    JSON.stringify repo, null, 2

  localPath = await octokit.shell.downloadAndArchive repo
  archiveStream = fs.createReadStream localPath
  console.log "[#{repo.full_name}] Uploading"
  await dropbox.uploadStream archivePath, archiveStream

tasks =
  stars: ->
    console.log "[github] Listing #{GITHUB_USERNAME}'s starred repos"
    starredRepos = await octokit.custom.listAllStarredRepos()
    console.log "[github] Found #{starredRepos.length} stars"
    await dropbox.uploadString '/github/stars.json',
      JSON.stringify starredRepos, null, 2

  repos: ->
    console.log "[github] Archiving all #{GITHUB_USERNAME}'s github contributions"
    maxConcurrentUploads = 5

    ownRepos = await octokit.custom.listAllRepos GITHUB_USERNAME
    reposContributedTo = await octokit.graphQL.allRepositoriesContributedTo()
    repos = ownRepos.concat reposContributedTo.map octokit.graphQL.toRestRepo
    console.log "[github] Found #{repos.length} repos"

    await eachLimit repos, maxConcurrentUploads, (repo) ->
      try
        await archiveRepo repo
      catch err
        console.error "[#{repo.full_name}] BACKUP FAILED"
        console.error "[#{repo.full_name}] #{err?.message ? JSON.stringify(err)}"
    console.log "[github] Done archiving repos"

  repo: (options) ->
    [owner, repo] = options.repo.split '/'
    {data: repo} = await octokit.repos.get {owner, repo}
    await archiveRepo repo

module.exports = tasks
