const dropboxV2Api = require('dropbox-v2-api');
const settings = require('../settings');
const {Readable} = require('stream');
const {promisify} = require('util');

async function unlessDoesNotExist(asyncFn) {
  try {
    return await asyncFn();
  } catch (error) {
    if ((error && error.code) === 409) {
      // path doesn't exist
      return null;
    }
    throw error;
  }
}

// See docs:
// - https://github.com/adasq/dropbox-v2-api/blob/master/EXAMPLES.md
// - http://dropbox.github.io/dropbox-sdk-js/Dropbox.html
class Dropbox {
  constructor() {
    this.dropbox = dropboxV2Api.authenticate({
      token: settings.DBOX_ACCESS_TOKEN,
    });
    this.dropboxAsPromised = promisify(this.dropbox);
  }

  // Returns null if the path doesn't exist
  // Returns JSON files already de-serialized
  async download(path) {
    return await unlessDoesNotExist(
      () =>
        new Promise((resolve, reject) => {
          const downloadStream = this.dropbox(
            {
              resource: 'files/download',
              parameters: {path},
            },
            (err, result, response) => {
              if (err) {
                return reject(err);
              } else {
                console.log(`[dropbox] Read ${result.size} bytes from ${path}`);
                return resolve(response.body);
              }
            }
          );
          downloadStream.resume();
        })
    );
  }

  async uploadStream(path, dataStream) {
    const meta = await this.dropboxAsPromised({
      resource: 'files/upload',
      parameters: {
        path: path,
        mode: 'overwrite',
      },
      readStream: dataStream,
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

  async uploadJSON(path, data) {
    return await this.uploadString(path, JSON.stringify(data, null, 2));
  }

  async delete(path) {
    await this.dropboxAsPromised({
      resource: 'files/delete_v2',
      parameters: {path},
    });
    return console.log(`[dropbox] Deleted ${path}`);
  }

  // Resolves to null for non-existant paths
  async getMetadata(path) {
    return await unlessDoesNotExist(() =>
      this.dropboxAsPromised({
        resource: 'files/get_metadata',
        parameters: {path},
      })
    );
  }
}

module.exports = Dropbox;
