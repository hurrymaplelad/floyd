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

app = ->
  Dbox.app
    app_key: settings.DBOX_APP_KEY
    app_secret: settings.DBOX_APP_SECRET

client = ->
  app().client
    oauth_token: settings.DBOX_ACCESS_TOKEN

DropBox = ->
  _.extend client(), {}

DropBox.launchAccessTokenWizard = ->
  app = app()
  exec = require('child_process').exec
  rl = require('readline').createInterface
    input: process.stdin
    output: process.stdout

  app.requesttoken failOnError (response) ->
    console.log "please visit #{response.authorize_url}"
    exec "open #{response.authorize_url}"
    rl.question "have you authorized the app? ", ->
      rl.close()
      app.accesstoken response, failOnError (accessToken) ->
        console.log "generated access token: #{accessToken.oauth_token}"
        console.log "good till revoked"

module.exports = DropBox