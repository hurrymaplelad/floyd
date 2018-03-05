const Dropbox = require('../dropbox');
const MountainProject = require('../mountain_project');

const mountainProject = yargs => {
  yargs.command({
    command: 'mp:ticks',
    describe: 'Save Mountain Project route ticks to dropbox',
    handler: async function() {
      const mp = new MountainProject();
      console.log(`[mountainproject] Listing user ${mp.id} ticks`);
      const {csv, tickCount} = await mp.ticks();
      console.log(`[mountainproject] Found ${tickCount} ticks`);
      const dropbox = new Dropbox();
      return dropbox.uploadString('/mountain-project/ticks.csv', csv);
    }
  });
};

module.exports = mountainProject;
