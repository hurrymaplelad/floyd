const expect = require('expect.js');
const settings = require('../settings');
const MountainProject = require('./client');

describe('Mountain Project integration', function() {
  describe('without an id configured', function() {
    const originalId = settings.MOUNTAIN_PROJECT_ID;

    beforeEach(function() {
      delete settings.MOUNTAIN_PROJECT_ID;
    });

    it('throws', function() {
      expect(() => new MountainProject()).to.throwException();
    });

    afterEach(function() {
      settings.MOUNTAIN_PROJECT_ID = originalId;
    });
  });

  describe('::ticks', function() {
    const mountainProject = new MountainProject();

    it('calls back with the list of routes ticked', async function() {
      this.timeout(10000);
      const {tickCount} = await mountainProject.ticks();
      expect(tickCount).to.be.greaterThan(0);
    });
  });
});
