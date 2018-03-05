const expect = require('expect.js');
const Dropbox = require('../../dropbox');
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
  this.timeout(5000);
  return await dropbox.delete('/tmp');
});
