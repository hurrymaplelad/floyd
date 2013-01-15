expect = require 'expect.js'
ITunes = require '../itunes'

describe 'iTunes', ->
  describe 'init', ->
    it 'loads an iTunes library full of tracks', ->
      iTunes = new ITunes().loadLibrary 'test/fixtures/Library.xml'
      expect(iTunes.library.Tracks).to.be.ok()
