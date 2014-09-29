expect = require 'expect.js'
MountainProject = require '../../mountain_project'

describe.only 'Mountain Project integration', ->
  beforeEach ->
    @mountainProject = new MountainProject()

  describe '::ticks', ->
    it 'calls back with the list of routes ticked', (done) ->
      @mountainProject.ticks (ticks) ->
        expect(ticks).to.match /Ticks for Adam/
        done()

