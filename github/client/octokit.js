const {Octokit} = require('@octokit/rest');
const settings = require('../../settings');
const LogLevels = require('../../settings/log_levels');

const noOp = () => {};

const auth = settings.GITHUB_ACCESS_TOKEN;
if (!auth) {
  console.log('GITHUB_ACCESS_TOKEN not set. Skipping Github authentication.');
  console.log('Expect stricter rate limits');
}
const logLevel = settings.LOG_LEVEL;
const octokit = new Octokit({
  auth,
  userAgent: 'hurrymaplelad/floyd',
  log: {
    debug: logLevel >= LogLevels.debug ? console.debug : noOp,
    info: logLevel >= LogLevels.info ? console.info : noOp,
    warn: logLevel >= LogLevels.warn ? console.warn : noOp,
    error: logLevel >= LogLevels.error ? console.error : noOp,
  },
});

module.exports = octokit;
