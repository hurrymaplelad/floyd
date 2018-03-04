
(function() {
  var expect, octokit, settings;

  expect = require('expect.js');

  octokit = require('../../github');

  settings = require('../../settings');

  describe('Github integration', function() {
    var username;
    username = settings.GITHUB_USERNAME;
    return it('can list repos', async function() {
      var response;
      response = (await octokit.repos.getForUser({
        username: username,
        type: 'owner',
        per_page: 5
      }));
      expect(response.data).to.not.be.empty;
      return expect(response.data[0].owner.login).to.be(username);
    });
  });

}).call(this);
