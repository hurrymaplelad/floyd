const childProcess = require('child_process');
const {promisify} = require('util');
const exec = promisify(childProcess.exec);

const shell = {
  downloadAndArchive: async function(repo) {
    // pre clean in case we have stale file from previous run
    await exec(`rm -rf temp/${repo.full_name} temp/${repo.full_name}.tar.gz`);
    await exec(`mkdir -p ${repo.full_name}`);
    console.log(`[${repo.full_name}] Cloning`);
    await exec(`git clone ${repo.clone_url} temp/${repo.full_name}`);
    console.log(`[${repo.full_name}] Tarballing`);
    await exec(`tar -czf ${repo.name}.tar.gz ${repo.name}`, {
      cwd: `temp/${repo.owner.login}`
    });
    return `temp/${repo.full_name}.tar.gz`;
  }
};

module.exports = shell;
