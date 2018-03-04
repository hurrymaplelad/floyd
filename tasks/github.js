
(function() {
  var Dropbox, GITHUB_USERNAME, archiveRepo, asyncjs, dropbox, eachLimit, fs, octokit, promisify, tasks;

  fs = require('fs');

  octokit = require('../github');

  Dropbox = require('../dropbox');

  ({GITHUB_USERNAME} = require('../settings'));

  ({promisify} = require('util'));

  asyncjs = require('async');

  eachLimit = promisify(asyncjs.eachLimit);

  dropbox = new Dropbox();

  archiveRepo = async function(repo) {
    var archivePath, archiveStream, localPath, meta, repoDir;
    console.log(`[${repo.full_name}] Archiving (${repo.size}K)`);
    repoDir = `/github/${repo.full_name}`;
    archivePath = `${repoDir}/${repo.name}.tar.gz`;
    // Check if repo has changed since last backup
    meta = (await dropbox.getMetadata(archivePath));
    if ((meta != null ? meta.server_modified : void 0) && (!meta.is_deleted) && (new Date(meta.server_modified) >= new Date(repo.pushed_at))) {
      console.log(`[${repo.full_name}] Skipping. Unchanged since ${new Date(repo.pushed_at)})`);
      return;
    }
    await dropbox.uploadString(`${repoDir}/github_meta.json`, JSON.stringify(repo, null, 2));
    localPath = (await octokit.shell.downloadAndArchive(repo));
    archiveStream = fs.createReadStream(localPath);
    console.log(`[${repo.full_name}] Uploading`);
    return (await dropbox.uploadStream(archivePath, archiveStream));
  };

  tasks = {
    stars: async function() {
      var starredRepos;
      console.log(`[github] Listing ${GITHUB_USERNAME}'s starred repos`);
      starredRepos = (await octokit.custom.listAllStarredRepos());
      console.log(`[github] Found ${starredRepos.length} stars`);
      return (await dropbox.uploadString('/github/stars.json', JSON.stringify(starredRepos, null, 2)));
    },
    repos: async function() {
      var maxConcurrentUploads, ownRepos, repos, reposContributedTo;
      console.log(`[github] Archiving all ${GITHUB_USERNAME}'s github contributions`);
      maxConcurrentUploads = 5;
      ownRepos = (await octokit.custom.listAllRepos(GITHUB_USERNAME));
      reposContributedTo = (await octokit.graphQL.allRepositoriesContributedTo());
      repos = ownRepos.concat(reposContributedTo.map(octokit.graphQL.toRestRepo));
      console.log(`[github] Found ${repos.length} repos`);
      await eachLimit(repos, maxConcurrentUploads, async function(repo) {
        var err, ref;
        try {
          return (await archiveRepo(repo));
        } catch (error) {
          err = error;
          console.error(`[${repo.full_name}] BACKUP FAILED`);
          return console.error(`[${repo.full_name}] ${(ref = err != null ? err.message : void 0) != null ? ref : JSON.stringify(err)}`);
        }
      });
      return console.log("[github] Done archiving repos");
    },
    repo: async function() {
      var owner, repo;
      [owner, repo] = process.env.slug.split('/');
      ({
        data: repo
      } = (await octokit.repos.get({owner, repo})));
      return (await archiveRepo(repo));
    }
  };

  module.exports = tasks;

}).call(this);
