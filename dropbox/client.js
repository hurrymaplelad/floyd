const dropboxV2Api = require('dropbox-v2-api');
const settings = require('../settings');
const {Readable} = require('stream');
const {promisify} = require('util');

// See docs:
// - https://github.com/adasq/dropbox-v2-api/blob/master/EXAMPLES.md
// - http://dropbox.github.io/dropbox-sdk-js/Dropbox.html
class Dropbox {
  constructor() {
    this.dropbox = dropboxV2Api.authenticate({
      token: settings.DBOX_ACCESS_TOKEN
    });
    this.dropbox = promisify(this.dropbox);
  }

  async uploadStream(path, dataStream) {
    const meta = await this.dropbox({
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
    const dataStream = new Readable();
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
    try {
      return await this.dropbox({
        resource: 'files/get_metadata',
        parameters: {
          path: path
        }
      });
    } catch (error) {
      if ((error && error.code) === 409) {
        // path doesn't exist
        return null;
      }
      throw error;
    }
  }
}

module.exports = Dropbox;
