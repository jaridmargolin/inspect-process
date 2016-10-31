#!/usr/bin/env node
'use strict';

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// 3rd party
const _ = require('lodash');

// lib
const inspect = require('../lib/index');


/* -----------------------------------------------------------------------------
 * inspect
 * ---------------------------------------------------------------------------*/

const args = process.argv.slice(2);
const dividerIndex = args.indexOf('--');

let cmd;
let nodeArgs;
let childArgs;

if (dividerIndex === -1) {
  cmd = args[0]
  nodeArgs = [];
  childArgs = args.slice(1);
} else {
  cmd = args[dividerIndex + 1];
  nodeArgs = args.slice(0, dividerIndex);
  childArgs = args.slice(dividerIndex + 2);
}

inspect(cmd, nodeArgs, childArgs)
  .then(() => process.exit())
  .catch(() => process.exit(1));
