const Todoist = require('todoist').v8;
const plist = require('plist');
const Dropbox = require('../dropbox/client');
const logging = require('../logging');
const FloydTodoistClient = require('./floyd_todoist_client');

const logger = logging.createLogger('todoist');

module.exports = (yargs) => {
  yargs.command({
    command: 'todoist:tasks',
    describe: 'Sync all tasks to Dropbox as links to Todoist UI',
    handler: async function () {
      logger.info(`Syncing`);
      const todoistClient = await FloydTodoistClient.init();
      logger.info(`Found ${todoistClient.countItems()} items`);

      const dropbox = new Dropbox();
      logger.info(`Wiping previous dump`);
      await dropbox.delete(`/todoist/tasks`);

      for (const item of todoistClient.iterateItems()) {
        const webloc = plist.build({
          URL: item.url(),
          details: JSON.stringify(item.details(), null, 2),
        });

        await dropbox.uploadString(
          `/todoist/tasks/${item.slug()}.webloc`,
          webloc
        );
      }
    },
  });
};
