const goodreads = require('goodreads-api-node');
const settings = require('../settings');

class GoodReads {
  static get COOLDOWN() {
    return 1000; // ms, from https://www.goodreads.com/api/terms
  }

  static sleep(ms = GoodReads.COOLDOWN) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  constructor() {
    this.gr = goodreads({
      key: settings.GOODREADS_APP_KEY,
      secret: settings.GOODREADS_APP_SECRET,
    });
    this.gr.initOAuth();
    this.gr.setAccessToken({
      token: settings.GOODREADS_OAUTH_TOKEN,
      secret: settings.GOODREADS_OAUTH_SECRET,
    });
  }

  async getAllBooksOnShelf(shelf) {
    const bookCount = Number(shelf.book_count._);
    const perPage = 150;
    let allBooks = [];

    console.log(`[goodreads] Fetching ${shelf.name} (${bookCount} books)`);
    for (let pageNum = 1; (pageNum - 1) * perPage <= bookCount; pageNum++) {
      await GoodReads.sleep();
      const page = await this.gr.getBooksOnUserShelf(
        settings.GOODREADS_USERID,
        shelf.name,
        {page: pageNum, per_page: perPage}
      );
      const books = page.books.book;

      console.log(`[goodreads] Got page ${pageNum} (${books.length} books)`);
      allBooks = allBooks.concat(books);
    }
    return allBooks;
  }
}

module.exports = GoodReads;
