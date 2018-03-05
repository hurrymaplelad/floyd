/**
 * Chore friendly wrapper around mountain project
 */
const fetch = require('node-fetch');
const settings = require('../settings');

class MountainProject {
  constructor() {
    this.id = settings.MOUNTAIN_PROJECT_ID;
    if (!this.id) {
      throw new Error('mountian project id required');
    }
  }

  async ticks() {
    const response = await fetch(
      'https://www.mountainproject.com/user/108776141/-/tick-export'
    );
    if (!response.ok) {
      this._fail(`${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) {
      this._fail(`Unexpected content-type: ${contentType}`);
    }
    const csv = await response.text();
    const matches = csv.match(/\d{4}-\d{2}-\d{2},/g);
    const tickCount = (matches && matches.length) || 0;
    if (!tickCount) {
      this._fail('No ticks!');
    }
    return {
      csv: csv,
      tickCount: tickCount
    };
  }

  _fail(message) {
    throw new Error(`[mountainproject] FAILED fetching ticks: ${message}`);
  }
}

module.exports = MountainProject;
