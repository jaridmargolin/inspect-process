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
const webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');

// shortcuts
const until = webdriver.until;
const By = webdriver.By;


/* -----------------------------------------------------------------------------
 * inspect
 * ---------------------------------------------------------------------------*/

module.exports = function (cmd, args) {
  return new Promise(function (resolve, reject) {
    const inspectArgs = ['--inspect=9227', '--debug-brk'];
    const colorArgs = ['--color', '--colors', '--ansi'];
    const procArgs = inspectArgs.concat([_getChildPath(cmd)], args || [], colorArgs);
    const proc = spawn('node', procArgs);
    const driver = new webdriver.Builder().forBrowser('chrome').build();

    const launchDebugger = function (debuggerUrl) {
      const window = driver.manage().window();
      window.getSize().then((size) => window.setSize(size.width, 450));

      driver.get(debuggerUrl);
      driver.wait(until.elementLocated(By.css('.cm-execution-line')));
      driver.executeScript('WebInspector.SourcesPanel.instance()._togglePause();');
    };

    const quitDebugger = function () {
      try { driver.quit(); } catch (e) {}
    };

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
        return launchDebugger(dataStr.substring(dataStr.indexOf('chrome-devtools')));

      } else if (isComplete) {
        return quitDebugger();

      } else if (!isAttached) {
        return process.stderr.write(data);
      }
    });

    proc.once('exit', resolveWithResult);
    proc.once('SIGINT', resolveWithResult);
    proc.once('SIGTERM', resolveWithResult);

    // safegaurd to ensure processes are cleaned up on exit
    exitHook(() => {
      quitDebugger();
      proc.kill();
    });
  });
};


/* -----------------------------------------------------------------------------
 * helpers
 * ---------------------------------------------------------------------------*/

const _getChildPath = function (cmd) {
  try {
    return which.sync(cmd);
  } catch (e) {
    return path.resolve(cmd);
  }
};
