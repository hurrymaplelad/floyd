const expect = require('expect.js');
const octokit = require('./client');
const settings = require('../settings');

describe('Github integration', function () {
  const username = settings.GITHUB_USERNAME;

  it('can list repos', async function () {
    const response = await octokit.rest.repos.listForUser({
      username: username,
      type: 'owner',
      per_page: 5,
    });
    expect(response.data).to.not.be.empty;
    expect(response.data[0].owner.login).to.be(username);
  });
});
