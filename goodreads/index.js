const Dropbox = require('../dropbox/client');
const GoodReads = require('./client');
const settings = require('../settings');
const dropbox = new Dropbox();

// GoodReads TOS say at most one call per second

const commands = function (yargs) {
  yargs
    .command({
      command: 'goodreads:shelves',
      describe: "Save the books I've read and want to read to Dropbox",
      handler: async function () {
        const goodreads = new GoodReads();
        console.log(`[goodreads] Archiving shelves`);
        const user = await goodreads.gr.getUserInfo(settings.GOODREADS_USERID);
        const shelves = user.user_shelves.user_shelf;
        console.log(`[goodreads] Found ${shelves.length} shelves`);
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
        console.log(`[goodreads] Generating an oauth token`);
        const goodreads = new GoodReads();
        goodreads.gr.initOAuth();
        const oauthUrl = await goodreads.gr.getRequestToken();
        console.log(`open ${oauthUrl}`);
        console.log(`then press any key to continue`);
        await new Promise((resolve) => process.stdin.once('data', resolve));
        await goodreads.gr.getAccessToken();
      },
    });
};

module.exports = commands;
