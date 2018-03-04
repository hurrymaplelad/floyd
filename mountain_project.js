(function() {
  // Chore friendly wrapper around mountain project

  var MountainProject, fetch, settings;

  fetch = require('node-fetch');

  settings = require('./settings');

  MountainProject = class MountainProject {
    constructor() {
      this.id = settings.MOUNTAIN_PROJECT_ID;
      if (!this.id) {
        throw new Error('mountian project id required');
      }
    }

    async ticks() {
      var contentType, csv, ref, ref1, response, tickCount;
      response = await fetch(
        'https://www.mountainproject.com/user/108776141/-/tick-export'
      );
      if (!response.ok) {
        this._fail(`${response.status} ${response.statusText}`);
      }
      contentType =
        (ref = response.headers.get('content-type')) != null ? ref : '';
      if (!contentType.includes('text/csv')) {
        this._fail(`Unexpected content-type: ${contentType}`);
      }
      csv = await response.text();
      tickCount =
        (ref1 = csv.match(/\d{4}-\d{2}-\d{2},/g)) != null
          ? ref1.length
          : void 0;
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
  };

  module.exports = MountainProject;
}.call(this));
