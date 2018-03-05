const expect = require('expect.js');
const settings = require('../settings');
const MountainProject = require('./client');

describe('Mountain Project integration', function() {
  describe('without an id configured', function() {
    beforeEach(function() {
      this.originalId = settings.MOUNTAIN_PROJECT_ID;
      return (settings.MOUNTAIN_PROJECT_ID = void 0);
    });
    afterEach(function() {
      return (settings.MOUNTAIN_PROJECT_ID = this.originalId);
    });
    return it('throws', function() {
      return expect(function() {
        return new MountainProject();
      }).to.throwException();
    });
  });
  return describe('::ticks', function() {
    beforeEach(function() {
      return (this.mountainProject = new MountainProject());
    });
    return it('calls back with the list of routes ticked', async function() {
      this.timeout(10000);
      const {tickCount} = await this.mountainProject.ticks();
      return expect(tickCount).to.be.greaterThan(0);
    });
  });
});
