'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const promise = require('selenium-webdriver/lib/promise')
const chromedriver = require('chromedriver')
const log = require('npmlog')

// shortcuts
const until = webdriver.until
const By = webdriver.By

/* -----------------------------------------------------------------------------
 * configure
 * -------------------------------------------------------------------------- */

promise.USE_PROMISE_MANAGER = false

/* -----------------------------------------------------------------------------
 * devtools public
 * -------------------------------------------------------------------------- */

const Devtools = module.exports = function (options) {
  log.silly('devtools: create')

  this.options = options || {}
  this.service = new chrome.ServiceBuilder(chromedriver.path).build()
  this.driver = chrome.Driver.createSession(new chrome.Options(), this.service)
}

Devtools.prototype.open = function (debuggerUrl, options) {
  log.silly('devtools: open')

  return this._resize()
    .then(() => this._navigateToUrl(debuggerUrl))
    .then(() => this._waitUntilPause())
    .then(() => this.options['debug-exception'] ? this._pauseOnException() : null)
    .then(() => this.options['debug-brk'] ? null : this._continueExecution())
    .then(() => this.onOpen ? this.onOpen() : null)
    .catch((e) => {
      log.verbose(e)
      // webdriver throws errors on already resolved promises upon manual browser
      // quit/close. This is a catch all to avoid killing the entire process.
    })
}

// wrapper around driver.quit to ensure error is caught if close gets called
// multiple times.
Devtools.prototype.close = function () {
  log.silly('devtools: close')

  return this.driver.quit()
    .then(() => this.service.stop())
    .catch((e) => null)
}

/* -----------------------------------------------------------------------------
 * devtools private
 * -------------------------------------------------------------------------- */

Devtools.prototype._resize = function () {
  log.silly('devtools: resize')

  const window = this.driver.manage().window()

  return window.getSize()
    .then((size) => window.setSize(size.width, 450))
}

Devtools.prototype._navigateToUrl = function (debuggerUrl) {
  log.silly('devtools: navigate')

  return this.driver.get(debuggerUrl)
}

Devtools.prototype._waitUntilPause = function () {
  log.silly('devtools: wait for pause')

  return this.driver.wait(until.elementLocated(By.css('.cm-execution-line')))
}

Devtools.prototype._pauseOnException = function () {
  log.silly('devtools: pause on exception')

  return this._executeOnPanel('_togglePauseOnExceptions')
}

Devtools.prototype._continueExecution = function () {
  log.silly('devtools: continue execution')

  return this._executeOnPanel('_togglePause')
}

Devtools.prototype._executeOnPanel = function (methodName) {
  let script = `const root = window['WebInspector'] || window['Sources'];`
  script += `return root.SourcesPanel.instance().${methodName}();`

  return this.driver.executeScript(script)
}
