const GoodReads = require('./goodreads');
const settings = require('../settings');
const logging = require('../logging');

const logger = logging.createLogger('goodreads');

class GoodReadsClient {
  constructor() {
    this.gr = new GoodReads({
      key: settings.GOODREADS_APP_KEY,
      secret: settings.GOODREADS_APP_SECRET,
      oauthToken: settings.GOODREADS_OAUTH_TOKEN,
      oauthTokenSecret: settings.GOODREADS_OAUTH_SECRET,
    });
  }

  async getAllBooksOnShelf({name: shelfName, bookCount}) {
    let allBooks = [];
    logger.info(`Fetching shelf "${shelfName}" (${bookCount} books)`);
    for await (let book of this.gr.listBooks({
      userId: settings.GOODREADS_USERID,
      shelf: shelfName,
    })) {
      allBooks.push(book);
      // Communicate progress
      if (allBooks.length % 100 === 0) {
        logger.info('.');
      }
    }
    return allBooks;
  }
}

module.exports = GoodReadsClient;
