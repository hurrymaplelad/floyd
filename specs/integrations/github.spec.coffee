expect = require 'expect.js'
Github = require 'github'
settings = require '../../settings'

describe 'Github integration', ->
  github = null
  username = settings.GITHUB_USERNAME

  beforeEach ->
    github = new Github version: '3.0.0'

  it 'can list repos', (done) ->
    github.repos.getFromUser
      user: username
      type: 'owner'
      per_page: 5
      (err, repos) ->
        expect(err).to.be null
        expect(repos[0].owner.login).to.be username
        done()


