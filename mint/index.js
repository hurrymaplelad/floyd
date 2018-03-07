const Dropbox = require('../dropbox/client');
const Mint = require('./client');
const {DateTime, Interval} = require('luxon');
const dropbox = new Dropbox();
const _ = require('underscore');

function ymKey(dateTime) {
  return dateTime.toISODate().slice(0, 7);
}

function transactionFilePath(monthString) {
  return `/mint/transactions/${monthString}.json`;
}

function formatInterval({start, end}) {
  return `${start.toISODate()} to ${end.toISODate()}`;
}

function splitAtMonths(fullInterval) {
  const months = [];
  const numMonths = fullInterval.count('months');
  let monthStart = fullInterval.start;
  let monthEnd;
  for (let i = 1; i < numMonths; i++) {
    monthEnd = monthStart.plus({months: 1}).startOf('month');
    months.push(Interval.fromDateTimes(monthStart, monthEnd));
    monthStart = monthEnd;
  }
  months.push(Interval.fromDateTimes(monthStart, fullInterval.end));
  return months;
}

async function archiveMonthOfTransactions(mint, monthInterval) {
  const monthString = ymKey(monthInterval.start);
  console.log(`[mint] Processing transactions for ${monthString}`);

  // Read month file from previous runs
  const existing =
    (await dropbox.download(transactionFilePath(monthString))) || [];
  // I don't trust the auto-magic response decoding
  if (!Array.isArray(existing)) {
    throw new Error(`[mint] Error: Couldnt decode existing file`);
  }
  console.log(`[mint] Merging with ${existing.length} existing transactions`);

  const mintTransactions = await mint.getAllTransactions(monthInterval);
  console.log(`[mint] Received ${mintTransactions.length} transactions`);

  const seen = _.indexBy(existing, 'id');
  const combined = existing.concat(
    // Preserve mint order, but de-dupe
    mintTransactions.filter(txn => !(txn.id in seen))
  );

  await dropbox.uploadJSON(transactionFilePath(monthString), combined);
}

function parseDateOption(dateString) {
  const dt = DateTime.fromISO(dateString, {zone: 'utc'});
  if (!dt || !dt.isValid) {
    throw new Error(`Invalid date ${dateString}`);
  }
  return dt;
}

const mint = function(yargs) {
  yargs
    .command({
      command: 'mint:transactions',
      describe:
        'Save transactions to dropbox for a timespan. Defaults to last week',
      builder: yargs =>
        yargs
          .option('start', {
            alias: 's',
            type: 'string',
            describe: 'Ex: 2004, 2004-10, 2004-10-20'
          })
          .requiresArg('start')
          .option('end', {
            alias: 'e',
            type: 'string',
            describe: 'Ex: 2004, 2004-10, 2004-10-20'
          })
          .requiresArg('end')
          .coerce({
            start: parseDateOption,
            end: parseDateOption
          })
          .implies({
            start: 'end',
            end: 'start'
          })
          .example(
            '$0 mint:transactions',
            'Archive the last week of transactions'
          )
          .example(
            '$0 mint:transactions --start 2018-01 --end 2018-01-24',
            'Archive transactions in the given date range'
          ),
      handler: async function(argv) {
        console.log(`[mint] Listing transactions`);
        const mint = await Mint.login();
        const end = argv.end || DateTime.utc();
        const start = argv.start || end.minus({days: 7});

        // Operate 1 month at a time for simplicity,
        // especially to disambiguate mint dates without a year
        const fullInterval = Interval.fromDateTimes(start, end);
        if (!fullInterval.isValid) {
          throw new Error(`Bad interval: ${fullInterval.invalidReason}`);
        }

        const monthIntervals = splitAtMonths(fullInterval);
        console.log(
          [`[mint] Split into ${monthIntervals.length} interval(s)]:`]
            .concat(monthIntervals.map(formatInterval))
            .join('\n    ')
        );

        for (let month of monthIntervals) {
          await archiveMonthOfTransactions(mint, month);
        }
      }
    })
    .command({
      command: 'mint:categories',
      describe: 'Save mint spending categories hierarchy',
      handler: async function() {
        console.log(`[mint] Listing categories`);
        const mint = await Mint.login();
        const categories = await mint.pm.getCategories();
        if (!categories.length) {
          throw new Error('[mint] Error: Categories are empty. Not writing');
        }
        console.log(`[mint] Writing ${categories.length} top-level categories`);
        await dropbox.uploadString(
          '/mint/categories.json',
          JSON.stringify(categories, null, 2)
        );
      }
    });
};

module.exports = mint;
