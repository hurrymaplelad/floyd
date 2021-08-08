const settings = require('../../settings');

const client = require('graphql-client')({
  url: 'https://api.github.com/graphql',
  headers: {
    Authorization: 'Bearer ' + settings.GITHUB_OAUTH_TOKEN,
  },
});

// Pass-through template tag triggering graphQL syntax support
const gql = (strings) => strings.join('');

async function _query(queryString, vars) {
  const response = await client.query(queryString, vars);
  if (response.errors) {
    for (const error of response.errors) {
      console.error(`[github] GraphQL error: ${error.message}`);
    }
    console.error(response.highlightQuery);
    throw response.errors[0];
  }
  return response;
}

async function _concatPages(query) {
  let afterId = null;
  let page = await query();
  let all = page.nodes;
  while (page.pageInfo.hasNextPage) {
    afterId = page.pageInfo.endCursor;
    page = await query(afterId);
    all = all.concat(page.nodes);
  }
  return all;
}

const graphQL = {
  allRepositoriesContributedTo: async function () {
    const contributedTo = await _concatPages(
      this.pageOfRepositoriesContributedTo
    );
    return contributedTo;
  },
  pageOfRepositoriesContributedTo: async (after) => {
    const response = await _query(
      gql`
        query contribs($after: String) {
          viewer {
            repositoriesContributedTo(
              first: 100
              contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]
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
        }
      `,
      {after}
    );
    return response.data.viewer.repositoriesContributedTo;
  },
  toRestRepo: function (repo) {
    return {
      name: repo.name,
      full_name: repo.nameWithOwner,
      pushed_at: repo.pushedAt,
      size: repo.diskUsage,
      clone_url: `${repo.url}.git`,
      owner: {
        login: repo.nameWithOwner.split('/')[0],
      },
    };
  },
};

module.exports = graphQL;
