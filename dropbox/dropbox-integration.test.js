const expect = require('expect.js');
const Dropbox = require('./client');
let dropbox;

before(function() {
  dropbox = new Dropbox();
});

describe('Dropbox integration', function() {
  return it('can write', async function() {
    const meta = await dropbox.uploadString('/tmp/test/write', 'success');
    return expect(meta.size).to.be(7);
  });
});

after(async function() {
  return await dropbox.delete('/tmp');
});
