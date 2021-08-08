const {Octokit} = require('@octokit/rest');
const logging = require('../../logging');
const settings = require('../../settings');

const logger = logging.createLogger('github/octokit');

const auth = settings.GITHUB_ACCESS_TOKEN;
if (!auth) {
  logger.warn('GITHUB_ACCESS_TOKEN not set. Skipping Github authentication.');
  logger.warn('Expect stricter rate limits');
}
const octokit = new Octokit({
  auth,
  userAgent: 'hurrymaplelad/floyd',
  log: {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
  },
});

module.exports = octokit;
