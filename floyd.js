#!/usr/bin/env node
const yargs = require('yargs');
[
  require('./github'),
  require('./mint'),
  require('./mountain_project'),
  require('./goodreads'),
].forEach((builder) => builder(yargs));

yargs.demandCommand().strict().argv;
