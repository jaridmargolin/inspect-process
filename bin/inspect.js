#!/usr/bin/env node
'use strict';

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// 3rd party
const _ = require('lodash/fp');
const yargs = require('yargs');
const v8flags = require('v8flags');

// lib
const inspect = require('../lib/index');


/* -----------------------------------------------------------------------------
 * inspect
 * ---------------------------------------------------------------------------*/

v8flags((err, result) => {
  if (err) {
    throw new Error(err);
  }

  const v8Flags = _.map((flag) => flag.substring(2))(result);
  const nodeFlags = ['preserve-symlinks', 'zero-fill-buffers', 'prof-process',
    'track-heap-objects', 'trace-sync-io', 'trace-warnings', 'no-warnings',
    'throw-deprecation', 'trace-deprecation', 'no-deprecation', 'interactive',
    'enable-fips', 'force-fips'];
  const nodeStringOptions = ['require', 'eval', 'print', 'icu-data-dir=dir',
  'openssl-config=path', 'tls-cipher-list=val'];
  const nodeNumberOptions = ['v8-pool-size'];

  const parsed = yargs
    .boolean(v8Flags)
    .boolean(nodeFlags)
    .string(nodeStringOptions)
    .number(nodeNumberOptions)
    .argv;

  const cmd = parsed._[0];
  const args = process.argv.slice(2);
  const options = {
    nodeArgs: _.difference(args)(parsed._),
    childArgs: parsed._.slice(1)
  };

  inspect(cmd, options)
    .then(() => process.exit())
    .catch(() => process.exit(1));
});
