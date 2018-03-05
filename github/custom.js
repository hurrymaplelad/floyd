const octokit = require('./octokit');
const fetch = require('node-fetch');

async function concatPageData(
  method,
  mapFn = function(x) {
    return x;
  }
) {
  let response = await method;
  let data = response.data.map(mapFn);
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response);
    data = data.concat(response.data.map(mapFn));
  }
  return data;
}

const custom = {
  // Like getArchiveLink, but streams the archive response instead of buffering
  // Note that these archives don't include history
  repoGetArchiveStream: async function({owner, repo, archive_format}) {
    if (archive_format == null) {
      archive_format = 'tarball';
    }
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/${archive_format}`
    );
    return {
      meta: response,
      data: response.body
    };
  },
  listAllRepos: async function(username) {
    const repos = await concatPageData(
      octokit.repos.getForUser({
        username: username,
        type: 'owner',
        per_page: 75 // bump up the default to consume less of our quota
      })
    );
    return repos.filter(function(repo) {
      return !repo.fork;
    });
  },
  listAllStarredRepos: async function() {
    const starredRepos = await concatPageData(
      octokit.activity.getStarredRepos({
        per_page: 75 // bump up the default to consume less of our quota
      }),
      function(response) {
        // the first page has starred_at, the rest don't >:(
        const repo = response.repo || response;
        return {
          full_name: repo.full_name,
          description: repo.description,
          updated_at: repo.updated_at,
          stargazers_count: repo.stargazers_count,
          language: repo.language
        };
      }
    );
    return starredRepos;
  }
};

module.exports = custom;
