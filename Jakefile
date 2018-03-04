const Dropbox = require('./dropbox');
const MountainProject = require('./mountain_project');
const github = require('./tasks/github');

namespace('github', () => {
  desc('save list of starred github repos to dropbox');
  task('stars', [], github.stars);

  desc('archive github repos to dropbox');
  task('repos', [], github.repos);

  desc('archive a single github repo to dropbox. ' +
       'Usage: `jake github:repo slug=hmlad/example`');
  task('repo', [], github.repo);
});

namespace('mp', () => {
  desc('write Mountain Project route ticks to dropbox')
  task('ticks', [], async function() {
    var csv, dropbox, mp, tickCount;
    mp = new MountainProject();
    console.log(`[mountainproject] Listing user ${mp.id} ticks`);
    ({csv, tickCount} = (await mp.ticks()));
    console.log(`[mountainproject] Found ${tickCount} ticks`);
    dropbox = new Dropbox();
    return dropbox.uploadString('/mountain-project/ticks.csv', csv);
  });
});
