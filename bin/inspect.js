#!/usr/bin/env node
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash/fp')
const yargs = require('yargs')
const nodeflags = require('nodeflags')

// lib
const inspect = require('../lib/index')

/* -----------------------------------------------------------------------------
 * usage
 * -------------------------------------------------------------------------- */

const inspectCliOptions = {
  'debug-exception': {
    type: 'boolean',
    description: 'Pause debugger on exceptions.'
  },
  'log-level': {
    type: 'string',
    description: 'The level to display logs at.',
    choices: ['silly', 'verbose', 'info'],
    default: 'info'
  }
}

// early parse in order to show inspect specific help options
yargs.options(inspectCliOptions)
  .usage('\nUsage:\ninspect [inspect options] [node options] [v8 options] [script] [arguments]')
  .version()
  .help()
  .argv

/* -----------------------------------------------------------------------------
 * inspect
 * -------------------------------------------------------------------------- */

nodeflags((err, flags) => {
  if (err) {
    throw new Error(err)
  }

  const parsed = yargs.options(flags).argv
  const args = process.argv.slice(2)
  const cmd = parsed._[0]
  const cmdIndex = args.indexOf(cmd)
  const processArgs = args.slice(0, cmdIndex)

  // all keys after the cmd should be considered childArgs
  const childArgs = args.slice(cmdIndex + 1)

  // inspectOptions are just picked from our parsed args. We pass "options"
  // rather than args because we are not proxying the args to the future
  // child_process
  const inspectKeys = _.keys(inspectCliOptions)
  const inspectFlags = _.map((key) => '--' + key)(inspectKeys)
  const inspectOptions = _.pick(inspectKeys)(parsed)

  // node args are simply processArgs that are not inspectArgs
  const nodeArgs = _.remove((arg) => {
    return inspectFlags.includes(arg.split('=')[0])
  })(processArgs)

  inspect(cmd, { nodeArgs, childArgs, inspectOptions })
    .then(() => process.exit())
    .catch(() => process.exit(1))
})
