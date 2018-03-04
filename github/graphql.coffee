settings = require '../settings'
client = require('graphql-client')({
  url: 'https://api.github.com/graphql',
  headers: {
    Authorization: 'Bearer ' + settings.GITHUB_OAUTH_TOKEN
  }
})

_query = (queryString, vars) ->
  response = await client.query queryString, vars
  if response.errors
    for error in response.errors
      console.error "[github] GraphQL error: #{error.message}"
    console.error response.highlightQuery
    throw response.errors[0]
  return response

_concatPages = (query) ->
  afterId = null
  page = await query()
  all = page.nodes
  while page.pageInfo.hasNextPage
    afterId = page.pageInfo.endCursor
    page = await query afterId
    all = all.concat page.nodes
  return all

graphQL =
  allRepositoriesContributedTo: ->
    contributedTo = await _concatPages @pageOfRepositoriesContributedTo
    return contributedTo

  pageOfRepositoriesContributedTo: (after) =>
    response = await _query """
      query contribs($after: String) {
        viewer {
          repositoriesContributedTo(
            first: 100,
            contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY],
            after: $after
          ) {
            nodes {
              name
              nameWithOwner
              pushedAt
              diskUsage
              url
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }""", {after}
    return response.data.viewer.repositoriesContributedTo

  toRestRepo: (repo) ->
    return
      name: repo.name
      full_name: repo.nameWithOwner
      pushed_at: repo.pushedAt
      size: repo.diskUsage
      clone_url: "#{repo.url}.git"
      owner:
        login: repo.nameWithOwner.split('/')[0]

module.exports = graphQL
