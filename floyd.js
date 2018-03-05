#!/usr/bin/env node
const yargs = require('yargs');
[require('./commands/github'), require('./commands/mountain_project')].forEach(
  builder => builder(yargs)
);

yargs.demandCommand().argv;
