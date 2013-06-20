expect = require 'expect.js'
Rdio = require '../rdio'

describe 'Rdio integration', ->
  it 'can load the user', (done) ->
    new Rdio().init (rdio) ->
      expect(rdio.user).to.be.ok()
      done()
