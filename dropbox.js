(function() {
  // Chore friendly wrapper around the Dbox library

  var Dropbox, Readable, dropboxV2Api, promisify, settings;

  dropboxV2Api = require('dropbox-v2-api');

  settings = require('./settings');

  ({Readable} = require('stream'));

  ({promisify} = require('util'));

  // See docs:
  // - https://github.com/adasq/dropbox-v2-api/blob/master/EXAMPLES.md
  // - http://dropbox.github.io/dropbox-sdk-js/Dropbox.html
  Dropbox = class Dropbox {
    constructor() {
      this.dropbox = dropboxV2Api.authenticate({
        token: settings.DBOX_ACCESS_TOKEN
      });
      this.dropbox = promisify(this.dropbox);
    }

    async uploadStream(path, dataStream) {
      var meta;
      meta = await this.dropbox({
        resource: 'files/upload',
        parameters: {
          path: path,
          mode: 'overwrite'
        },
        readStream: dataStream
      });
      console.log(
        `[dropbox] Wrote ${meta != null ? meta.size : void 0} bytes to ${path}`
      );
      return meta;
    }

    async uploadString(path, data) {
      var dataStream;
      dataStream = new Readable();
      dataStream.push(data);
      dataStream.push(null);
      return await this.uploadStream(path, dataStream);
    }

    async delete(path) {
      await this.dropbox({
        resource: 'files/delete_v2',
        parameters: {
          path: path
        }
      });
      return console.log(`[dropbox] Deleted ${path}`);
    }

    // Resolves to null for non-existant paths
    async getMetadata(path) {
      var err;
      try {
        return await this.dropbox({
          resource: 'files/get_metadata',
          parameters: {
            path: path
          }
        });
      } catch (error) {
        err = error;
        if ((err != null ? err.code : void 0) === 409) {
          // path doesn't exist
          return null;
        }
        throw err;
      }
    }
  };

  module.exports = Dropbox;
}.call(this));
