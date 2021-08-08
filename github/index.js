const fs = require('fs');
const octokit = require('./client');
const Dropbox = require('../dropbox/client');
const {GITHUB_USERNAME} = require('../settings');
const {promisify} = require('util');
const asyncjs = require('async');
const eachLimit = promisify(asyncjs.eachLimit);
const dropbox = new Dropbox();

async function archiveRepo(repo) {
  console.log(`[${repo.full_name}] Archiving (${repo.size}K)`);
  const repoDir = `/github/${repo.full_name}`;
  const archivePath = `${repoDir}/${repo.name}.tar.gz`;
  // Check if repo has changed since last backup
  const meta = await dropbox.getMetadata(archivePath);
  if (
    (meta != null ? meta.server_modified : void 0) &&
    !meta.is_deleted &&
    new Date(meta.server_modified) >= new Date(repo.pushed_at)
  ) {
    console.log(
      `[${repo.full_name}] Skipping. Unchanged since ${new Date(
        repo.pushed_at
      )})`
    );
    return;
  }
  await dropbox.uploadString(
    `${repoDir}/github_meta.json`,
    JSON.stringify(repo, null, 2)
  );
  const localPath = await octokit.shell.downloadAndArchive(repo);
  const archiveStream = fs.createReadStream(localPath);
  console.log(`[${repo.full_name}] Uploading`);
  return await dropbox.uploadStream(archivePath, archiveStream);
}

const github = function (yargs) {
  yargs
    .command({
      command: 'github:stars',
      describe: 'Save list of starred github repos to dropbox',
      handler: async function () {
        console.log(`[github] Listing ${GITHUB_USERNAME}'s starred repos`);
        const starredRepos = await octokit.custom.listAllStarredRepos(
          GITHUB_USERNAME
        );
        console.log(`[github] Found ${starredRepos.length} stars`);
        return await dropbox.uploadString(
          '/github/stars.json',
          JSON.stringify(starredRepos, null, 2)
        );
      },
    })
    .command({
      command: 'github:repo <repo>',
      describe: 'Archive a single github repo to dropbox',
      builder: (yargs) =>
        yargs
          .example('$0 github:repo hmlad/floyd')
          .positional('repo', {
            describe: 'Owner and repo name (ex: hmlad/floyd)',
          })
          .demand('repo'),
      handler: async function (argv) {
        const [owner, repoName] = argv.repo.split('/');
        const {data: repo} = await octokit.rest.repos.get({
          owner,
          repo: repoName,
        });
        return await archiveRepo(repo);
      },
    })
    .command({
      command: 'github:repos',
      describe: 'Archive github repos to dropbox',
      handler: async function () {
        console.log(
          `[github] Archiving all ${GITHUB_USERNAME}'s github contributions`
        );
        const maxConcurrentUploads = 5;
        const ownRepos = await octokit.custom.listAllRepos(GITHUB_USERNAME);
        const reposContributedTo =
          await octokit.graphQL.allRepositoriesContributedTo();
        const repos = ownRepos.concat(
          reposContributedTo.map(octokit.graphQL.toRestRepo)
        );
        console.log(`[github] Found ${repos.length} repos`);
        await eachLimit(repos, maxConcurrentUploads, async function (repo) {
          try {
            return await archiveRepo(repo);
          } catch (err) {
            console.error(`[${repo.full_name}] BACKUP FAILED`);
            return console.error(
              `[${repo.full_name}] ${
                (err && err.message) != null ? err.message : JSON.stringify(err)
              }`
            );
          }
        });
        console.log('[github] Done archiving repos');
      },
    });
};

module.exports = github;
