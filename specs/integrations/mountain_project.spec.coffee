expect = require 'expect.js'
settings = require '../../settings'
MountainProject = require '../../mountain_project'

describe 'Mountain Project integration', ->

  describe 'without an id configured', ->
    beforeEach ->
      @originalId = settings.MOUNTAIN_PROJECT_ID
      settings.MOUNTAIN_PROJECT_ID = undefined

    afterEach ->
      settings.MOUNTAIN_PROJECT_ID = @originalId

    it 'throws', ->
      expect(-> new MountainProject()).to.throwException()

  describe '::ticks', ->
    beforeEach ->
      @mountainProject = new MountainProject()

    it 'calls back with the list of routes ticked', (done) ->
      @mountainProject.ticks (ticks) ->
        expect(ticks).to.match /Ticks for Adam/
        done()
