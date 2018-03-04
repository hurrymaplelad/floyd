(function() {
  var Dropbox, expect;

  expect = require('expect.js');

  Dropbox = require('../../dropbox');

  describe('Dropbox integration', function() {
    return it('can write', async function() {
      var dropbox, meta;
      dropbox = new Dropbox();
      meta = await dropbox.uploadString('/tmp/test/write', 'success');
      return expect(meta.size).to.be(7);
    });
  });

  after(async function() {
    var dropbox;
    this.timeout(5000);
    dropbox = new Dropbox();
    return await dropbox.delete('/tmp');
  });
}.call(this));
