#
# Chore friendly wrapper around the Dbox library
#

dropboxV2Api = require 'dropbox-v2-api'
settings = require './settings'
{Readable} = require 'stream'
{promisify} = require 'util'

# See docs:
# - https://github.com/adasq/dropbox-v2-api/blob/master/EXAMPLES.md
# - http://dropbox.github.io/dropbox-sdk-js/Dropbox.html
class Dropbox
  constructor: ->
    @dropbox = dropboxV2Api.authenticate token: settings.DBOX_ACCESS_TOKEN
    @dropbox = promisify @dropbox

  uploadStream: (path, dataStream) ->
    meta = await @dropbox
      resource: 'files/upload',
      parameters:
          path: path
          mode: 'overwrite'
      readStream: dataStream
    console.log "[dropbox] Wrote #{meta?.size} bytes to #{path}"
    return meta

  uploadString: (path, data) ->
    dataStream = new Readable()
    dataStream.push data
    dataStream.push null
    await @uploadStream path, dataStream

  delete: (path) ->
    await @dropbox
      resource: 'files/delete_v2'
      parameters:
          path: path
    console.log "[dropbox] Deleted #{path}"

  # Resolves to null for non-existant paths
  getMetadata: (path) ->
    try
      return await @dropbox
        resource: 'files/get_metadata'
        parameters:
          path: path
    catch err
      if err?.code == 409 # path doesn't exist
        return null
      throw err

module.exports = Dropbox
