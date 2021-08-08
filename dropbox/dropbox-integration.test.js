const expect = require('expect.js');
const Dropbox = require('./client');

describe('Dropbox integration', function () {
  const dropbox = new Dropbox();

  it('can write', async function () {
    const meta = await dropbox.uploadString('/tmp/test/write', 'success');
    expect(meta.size).to.be(7);
  });

  after(async function () {
    await dropbox.delete('/tmp');
  });
});
