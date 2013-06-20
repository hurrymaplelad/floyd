#
# Chore friendly wrapper around the Dbox library
#

_ = require 'underscore'
Dbox = require 'dbox'
settings = require './settings'

failOnError = (cb) ->
  (err, response) ->
    if err? and err isnt 200
      throw err
    cb response

class Dropbox
  constructor: ->
    @app = Dbox.app
      app_key: settings.DBOX_APP_KEY
      app_secret: settings.DBOX_APP_SECRET

    @client =
      _(@app.client
        oauth_token: settings.DBOX_ACCESS_TOKEN
        oauth_token_secret: settings.DBOX_ACCESS_SECRET
      ).extend
        dump: (path, data) ->
          @put path, JSON.stringify(data, null, '  '), failOnError (meta) ->
            console.log "wrote #{meta?.bytes} bytes to #{path}"
        parse: (path, cb) ->
          @get path, failOnError (reply) ->
            cb JSON.parse(reply)

  launchAccessTokenWizard: ->
    exec = require('child_process').exec
    rl = require('readline').createInterface
      input: process.stdin
      output: process.stdout

    @app.requesttoken failOnError (response) =>
      console.log "please visit #{response.authorize_url}"
      exec "open #{response.authorize_url}"
      rl.question "press enter after you authorize the app in a browser: ", =>
        rl.close()
        @app.accesstoken response, failOnError (accessToken) =>
          console.log "granted access:"
          console.log "  DBOX_ACCESS_TOKEN: #{accessToken.oauth_token}"
          console.log "  DBOX_ACCESS_SECRET: #{accessToken.oauth_token_secret}"
          console.log "good till revoked or regenerated"

module.exports = Dropbox