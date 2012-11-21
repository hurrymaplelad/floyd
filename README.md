![from Jet Force Gemini](http://hurrymaplelad.com/images/floyd.jpg)

Floyd is a collection of tasks run periodically to backup and check the 
status of my favorite services.

## Getting Started

Tasks are defined in the `Cakefile`.  Try listing them with

    > cake

## Configuration

Check `reference.settings.coffee` for all API keys configurable as environment variables or in `local.settings.coffee`.

The Dropbox Access Token is a bit tedious to get.  `cake dbox:access` will generate one after you've configured an App Key and App Secret pair.