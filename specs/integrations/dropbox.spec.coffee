expect = require 'expect.js'
Dropbox = require '../../dropbox'

describe 'Dropbox integration', ->

  it 'can write', ->
    dropbox = new Dropbox()
    meta = await dropbox.uploadString '/tmp/test/write', 'success'
    expect(meta.size).to.be 7

after ->
  @timeout 5000
  dropbox = new Dropbox()
  await dropbox.delete '/tmp'
