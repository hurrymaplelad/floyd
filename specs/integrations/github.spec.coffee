expect = require 'expect.js'
octokit = require '../../github'
settings = require '../../settings'

describe 'Github integration', ->
  username = settings.GITHUB_USERNAME

  it 'can list repos', ->
    response = await octokit.repos.getForUser
      username: username
      type: 'owner'
      per_page: 5

    expect(response.data).to.not.be.empty
    expect(response.data[0].owner.login).to.be username
