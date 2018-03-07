#!/usr/bin/env node
const yargs = require('yargs');
[require('./github'), require('./mint'), require('./mountain_project')].forEach(
  builder => builder(yargs)
);

yargs.demandCommand().strict().argv;
