(function() {
  var concatPageData, custom, fetch, octokit;

  octokit = require('./octokit');

  fetch = require('node-fetch');

  concatPageData = async function(
    method,
    mapFn = function(x) {
      return x;
    }
  ) {
    var data, response;
    response = await method;
    data = response.data.map(mapFn);
    while (octokit.hasNextPage(response)) {
      response = await octokit.getNextPage(response);
      data = data.concat(response.data.map(mapFn));
    }
    return data;
  };

  custom = {
    // Like getArchiveLink, but streams the archive response instead of buffering
    // Note that these archives don't include history
    repoGetArchiveStream: async function({owner, repo, archive_format}) {
      var response;
      if (archive_format == null) {
        archive_format = 'tarball';
      }
      response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/${archive_format}`
      );
      return {
        meta: response,
        data: response.body
      };
    },
    listAllRepos: async function(username) {
      var repos;
      repos = await concatPageData(
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
      var starredRepos;
      starredRepos = await concatPageData(
        octokit.activity.getStarredRepos({
          per_page: 75 // bump up the default to consume less of our quota
        }),
        function(response) {
          var ref, repo;
          // the first page has starred_at, the rest don't >:(
          repo = (ref = response.repo) != null ? ref : response;
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
}.call(this));
