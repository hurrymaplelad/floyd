expect = require 'expect.js'
Rdio = require '../rdio'

describe 'Rdio', ->

  describe 'init()', -> 
    it 'loads the user', (done) ->
      new Rdio().init (rdio) ->
        expect(rdio.user).to.be.ok()  
        done()
