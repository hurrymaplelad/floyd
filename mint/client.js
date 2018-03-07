const pepperMint = require('pepper-mint');
const settings = require('../settings');
const {DateTime} = require('luxon');

// infered from responses. likely to change without warning
const PAGE_SIZE = 100;

class Mint {
  constructor(pm) {
    this.pm = pm;
  }

  static async login() {
    const pm = await pepperMint(
      settings.MINT_USERNAME,
      settings.MINT_PASS,
      settings.MINT_COOKIE
    );
    return new Mint(pm);
  }

  static parseDate(mintDate) {
    const dateTime = [
      'MMM d', // Ex: 'Mar 3', used ~2018
      'MM/dd/yy' // Ex: '05/01/16', used ~2016
    ].find(format => DateTime.fromFormat(mintDate, format, {zone: 'utc'}));

    if (dateTime == null) {
      throw new Error(`[mint] Error: unparsable date [${mintDate}]`);
    }
    return dateTime;
  }

  async getAllTransactions(interval) {
    let offset = 0;
    const getPage = async () => {
      console.log(`[mint] Fetching page of transactions, offset ${offset}`);
      return await this.pm.getTransactions({
        startDate: interval.start.toJSDate(),
        endDate: interval.end.toJSDate(),
        offset
      });
    };
    let page = await getPage();
    let transactions = page;
    while (page.length >= PAGE_SIZE) {
      offset += PAGE_SIZE;
      page = await getPage();
      transactions = transactions.concat(page);
    }
    return transactions;
  }
}

module.exports = Mint;
