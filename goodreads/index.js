const Dropbox = require('../dropbox/client');
const GoodReads = require('./client');
const settings = require('../settings');
const logging = require('../logging');
const dropbox = new Dropbox();

const logger = logging.createLogger('goodreads');

const commands = function (yargs) {
  yargs
    .command({
      command: 'goodreads:shelves',
      describe: "Save the books I've read and want to read to Dropbox",
      handler: async function () {
        const goodreads = new GoodReads();
        logger.info(`Archiving shelves`);
        const shelves = await goodreads.gr.listShelves(
          settings.GOODREADS_USERID
        );
        // const shelves = user.user_shelves.user_shelf;
        logger.info(`Found ${shelves.length} shelves`);
        for (const shelf of shelves) {
          const books = await goodreads.getAllBooksOnShelf(shelf);
          await dropbox.uploadString(
            `/goodreads/${shelf.name}.json`,
            JSON.stringify(books, null, 2)
          );
        }
      },
    })
    .command({
      command: 'goodreads:oauth',
      describe: 'Generate an oauth token',
      handler: async function () {
        logger.info(`Generating an oauth token`);
        const goodreads = new GoodReads();
        const {url: oauthUrl} = await new Promise((resolve) =>
          goodreads.gr.requestToken(resolve)
        );
        logger.info(`open ${oauthUrl}`);
        logger.info(`then press any key to continue`);
        await new Promise((resolve) => process.stdin.once('data', resolve));
        await goodreads.gr.processCallback(/* TODO */);
      },
    });
};

module.exports = commands;
