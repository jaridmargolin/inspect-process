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
 * usage
 * ---------------------------------------------------------------------------*/

const inspectCliOptions = {
  'debug-exception': {
    type: 'boolean',
    description: 'Pause debuuger on exceptions.'
  },
  'verbose': {
    type: 'boolean',
    description: 'Show all output from --inspect.'
  }
};

// early parse in order to show inspect specific help options
yargs.options(inspectCliOptions)
  .usage('\nUsage:\ninspect [inspect options] [node options] [v8 options] [script] [arguments]')
  .version()
  .help()
  .argv;


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

  // all keys after the cmd should be considered childArgs
  const childArgs = args.slice(args.indexOf(cmd) + 1);

  // inspectOptions are just picked from our parsed args. We pass "options"
  // rather than args because we are not proxying the args to the future
  // child_process
  const inspectKeys = _.keys(inspectCliOptions);
  const inspectArgs = _.map((key) => '--' + key)(inspectKeys);
  const inspectOptions = _.pick(inspectKeys)(parsed);

  // node args are simply all remaing args
  const nodeArgs = _.difference(args)(parsed._.concat(inspectArgs))

  inspect(cmd, {
      nodeArgs: nodeArgs,
      childArgs: childArgs,
      inspectOptions: inspectOptions
    })
    .then(() => process.exit())
    .catch(() => process.exit(1));
});
