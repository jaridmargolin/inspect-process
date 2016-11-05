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
const options = {};
let cmd;

if (dividerIndex === -1) {
  cmd = args[0]
  options['childArgs'] = args.slice(1);
} else {
  cmd = args[dividerIndex + 1];
  options['nodeArgs'] = args.slice(0, dividerIndex);
  options['childArgs'] = args.slice(dividerIndex + 2);
}

inspect(cmd, options)
  .then(() => process.exit())
  .catch(() => process.exit(1));
