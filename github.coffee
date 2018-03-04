octokit = require('@octokit/rest')()
fetch = require 'node-fetch'
settings = require './settings'

if settings.GITHUB_OAUTH_TOKEN
  octokit.authenticate
    type: 'oauth'
    token: settings.GITHUB_OAUTH_TOKEN
else
  console.log 'GITHUB_OAUTH_TOKEN not set. Skipping Github authentication.'
  console.log 'Expect stricter rate limits'

octokit.custom =
  # Like getArchiveLink, but streams the archive response instead of buffering
  # Note that these archives don't include history
  repoGetArchiveStream: ({owner, repo, archive_format}) ->
    archive_format ?= 'tarball'
    response = await fetch "https://api.github.com/repos/#{owner}/#{repo}/#{archive_format}"
    return
      meta: response
      data: response.body

module.exports = octokit
