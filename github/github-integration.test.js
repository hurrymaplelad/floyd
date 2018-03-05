const expect = require('expect.js');
const octokit = require('./client');
const settings = require('../settings');

describe('Github integration', function() {
  const username = settings.GITHUB_USERNAME;
  return it('can list repos', async function() {
    const response = await octokit.repos.getForUser({
      username: username,
      type: 'owner',
      per_page: 5
    });
    expect(response.data).to.not.be.empty;
    return expect(response.data[0].owner.login).to.be(username);
  });
});
