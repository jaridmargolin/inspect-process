'use strict';

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// core
const path = require('path');
const spawn = require('child_process').spawn;

// 3rd party
const _ = require('lodash');
const which = require('which');
const exitHook = require('exit-hook');

// lib
const Devtools = require('./devtools');


/* -----------------------------------------------------------------------------
 * inspect
 * ---------------------------------------------------------------------------*/

module.exports = function (cmd, childArgs) {
  const getPathToCmd = function (cmd) {
    try { return which.sync(cmd); }
    catch (e) { return path.resolve(cmd); }
  };

  return new Promise(function (resolve, reject) {
    const inspectArgs = ['--inspect=9227', '--debug-brk'];
    const colorArgs = ['--color', '--colors', '--ansi'];
    const args = inspectArgs.concat([getPathToCmd(cmd)], childArgs || [], colorArgs);
    const proc = spawn('node', args);
    const devtools = new Devtools();

    const resolveWithResult = function () {
      return proc.exitCode ? reject() : resolve();
    };

    proc.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      const dataStr = data.toString();
      const isListening = dataStr.startsWith('Debugger listening on port');
      const isAttached = dataStr.startsWith('Debugger attached');
      const isComplete = dataStr.startsWith('Waiting for the debugger to disconnect');

      if (isListening) {
        return devtools.open(dataStr.substring(dataStr.indexOf('chrome-devtools')));

      } else if (isComplete) {
        return devtools.close();

      } else if (!isAttached) {
        return process.stderr.write(data);
      }
    });

    proc.once('exit', resolveWithResult);
    proc.once('SIGINT', resolveWithResult);
    proc.once('SIGTERM', resolveWithResult);

    // safegaurd to ensure processes are cleaned up on exit
    exitHook(() => {
      devtools.close();
      proc.kill();
    });
  });
};
