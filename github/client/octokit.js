const octokit = require('@octokit/rest')();
const settings = require('../../settings');

if (settings.GITHUB_OAUTH_TOKEN) {
  octokit.authenticate({
    type: 'oauth',
    token: settings.GITHUB_OAUTH_TOKEN,
  });
} else {
  console.log('GITHUB_OAUTH_TOKEN not set. Skipping Github authentication.');
  console.log('Expect stricter rate limits');
}

module.exports = octokit;
