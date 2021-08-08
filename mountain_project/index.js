const Dropbox = require('../dropbox/client');
const logging = require('../logging');
const MountainProject = require('./client');

const logger = logging.createLogger('mountainproject');

const mountainProject = (yargs) => {
  yargs.command({
    command: 'mp:ticks',
    describe: 'Save Mountain Project route ticks to dropbox',
    handler: async function () {
      const mp = new MountainProject();
      logger.info(`Listing user ${mp.id} ticks`);
      const {csv, tickCount} = await mp.ticks();
      logger.info(`Found ${tickCount} ticks`);
      const dropbox = new Dropbox();
      return dropbox.uploadString('/mountain-project/ticks.csv', csv);
    },
  });
};

module.exports = mountainProject;
