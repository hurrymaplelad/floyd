(function() {
  var _concatPages, _query, client, graphQL, settings;

  settings = require('../settings');

  client = require('graphql-client')({
    url: 'https://api.github.com/graphql',
    headers: {
      Authorization: 'Bearer ' + settings.GITHUB_OAUTH_TOKEN
    }
  });

  _query = async function(queryString, vars) {
    var error, i, len, ref, response;
    response = await client.query(queryString, vars);
    if (response.errors) {
      ref = response.errors;
      for (i = 0, len = ref.length; i < len; i++) {
        error = ref[i];
        console.error(`[github] GraphQL error: ${error.message}`);
      }
      console.error(response.highlightQuery);
      throw response.errors[0];
    }
    return response;
  };

  _concatPages = async function(query) {
    var afterId, all, page;
    afterId = null;
    page = await query();
    all = page.nodes;
    while (page.pageInfo.hasNextPage) {
      afterId = page.pageInfo.endCursor;
      page = await query(afterId);
      all = all.concat(page.nodes);
    }
    return all;
  };

  graphQL = {
    allRepositoriesContributedTo: async function() {
      var contributedTo;
      contributedTo = await _concatPages(this.pageOfRepositoriesContributedTo);
      return contributedTo;
    },
    pageOfRepositoriesContributedTo: async after => {
      var response;
      response = await _query(
        `
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
        }`,
        {after}
      );
      return response.data.viewer.repositoriesContributedTo;
    },
    toRestRepo: function(repo) {
      return {
        name: repo.name,
        full_name: repo.nameWithOwner,
        pushed_at: repo.pushedAt,
        size: repo.diskUsage,
        clone_url: `${repo.url}.git`,
        owner: {
          login: repo.nameWithOwner.split('/')[0]
        }
      };
    }
  };

  module.exports = graphQL;
}.call(this));
