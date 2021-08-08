const octokit = require('./octokit');
const fetch = require('node-fetch');

const custom = {
  // Like getArchiveLink, but streams the archive response instead of buffering
  // Note that these archives don't include history
  repoGetArchiveStream: async function ({owner, repo, archive_format}) {
    if (archive_format == null) {
      archive_format = 'tarball';
    }
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/${archive_format}`
    );
    return {
      meta: response,
      data: response.body,
    };
  },
  listAllRepos: async function (username) {
    const repos = await octokit.paginate(octokit.rest.repos.listForUser, {
      username: username,
      type: 'owner',
      per_page: 75, // bump up the default to consume less of our quota
    });
    return repos.filter(function (repo) {
      return !repo.fork;
    });
  },
  listAllStarredRepos: async function (username) {
    const starredRepos = await octokit.paginate(
      octokit.rest.activity.listReposStarredByUser,
      {
        username,
        per_page: 75, // bump up the default to consume less of our quota
      }
    );
    return starredRepos.map(function (repo) {
      return {
        full_name: repo.full_name,
        description: repo.description,
        updated_at: repo.updated_at,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
      };
    });
  },
};

module.exports = custom;
