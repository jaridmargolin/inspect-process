'use strict';

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// 3rd party
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

// shortcuts
const until = webdriver.until;
const By = webdriver.By;


/* -----------------------------------------------------------------------------
 * devtools public
 * ---------------------------------------------------------------------------*/

const Devtools = module.exports = function (options) {
  this.options = options || {};
  this.service = new chrome.ServiceBuilder(chromedriver.path).build();
  this.driver = chrome.Driver.createSession(new chrome.Options(), this.service);
};

Devtools.prototype.open = function (debuggerUrl, options) {
  return this._resize()
    .then(() => this._navigateToUrl(debuggerUrl))
    .then(() => this._waitUntilPause())
    .then(() => this.options['debug-exception'] ? this._pauseOnException() : null)
    .then(() => this._continueExecution())
    .then(() => this.onOpen ? this.onOpen() : null)
    .catch((e) => {
      // webdriver throws errors on already resolved promises upon manual browser
      // quit/close. This is a vach all to avoid killing the entire process.
    });
};

// wrapper around driver.quit to ensure error is caught if close gets called
// multiple times.
Devtools.prototype.close = function () {
  try {
    this.driver.quit();
    this.service.stop();
  } catch (e) {}
};


/* -----------------------------------------------------------------------------
 * devtools private
 * ---------------------------------------------------------------------------*/

Devtools.prototype._resize = function () {
  const window = this.driver.manage().window();

  return window.getSize()
    .then((size) => window.setSize(size.width, 450));
};

Devtools.prototype._navigateToUrl = function (debuggerUrl) {
  return this.driver.get(debuggerUrl);
};

Devtools.prototype._waitUntilPause = function () {
  return this.driver.wait(until.elementLocated(By.css('.cm-execution-line')));
};

Devtools.prototype._pauseOnException = function () {
  const script = 'WebInspector.SourcesPanel.instance()._togglePauseOnExceptions();';
  return this.driver.executeScript(script);
};

Devtools.prototype._continueExecution = function () {
  const script = 'WebInspector.SourcesPanel.instance()._togglePause();';
  return this.driver.executeScript(script);
};
