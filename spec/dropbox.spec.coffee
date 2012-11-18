expect = require 'expect.js'
Dropbox = require '../dropbox'

describe 'Dropbox', ->

  it 'can write', (done) ->
    box = new Dropbox().client
    box.put 'tmp/test/write', 'success', (status, meta) ->
      expect(status).to.be 200
      expect(meta.bytes).to.be 7
      done()

after (done) ->
  this.timeout 5000
  box = new Dropbox().client
  box.rm 'tmp', -> done()


