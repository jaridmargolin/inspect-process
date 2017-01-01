/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const spawn = require('child_process').spawn
const path = require('path')
const net = require('net')

// 3rd party
const _ = require('lodash/fp')
const assert = require('chai').assert
const stdout = require('test-console').stdout
const stderr = require('test-console').stderr

// lib
const inspect = require('../lib/index')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const executablePath = path.resolve(__dirname, '..', 'bin', 'inspect.js')
const fixturesPath = path.resolve(__dirname, 'fixtures')

const successPath = path.resolve(fixturesPath, 'success')
const errorPath = path.resolve(fixturesPath, 'error')
const exceptionPath = path.resolve(fixturesPath, 'exception')

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('inspect', function () {
  before(function () {
    process.env['PATH'] += ':' + fixturesPath
  })

  beforeEach(function () {
    this.stdout = stdout.inspect()
    this.stderr = stderr.inspect()
  })

  afterEach(function () {
    this.stdout.restore()
    this.stderr.restore()

    // mocha results are printed to stdout
    process.stdout.write(_.last(this.stdout.output))
  })

  /* ---------------------------------------------------------------------------
   * api
   * ------------------------------------------------------------------------ */

  describe('api', function () {
    it('Should resolve with success.', function () {
      return inspect(successPath)
    })

    it('Should reject with error.', function () {
      return inspect(errorPath)
        .then(() => { throw new Error('Promise was resolved') })
        .catch(() => true)
    })

    it('Should resolve files found in path.', function () {
      return inspect('success')
    })

    it('Should hide --inspect generated stderr.', function () {
      return inspect(successPath)
        .then(() => assert.equal(this.stderr.output.length, 0))
    })

    it('Should forward child process stderr.', function () {
      return inspect(errorPath)
        .then(() => { throw new Error('Promise was resolved') })
        .catch(() => assert.equal(this.stderr.output.length, 1))
    })

    it('Should forward all stdout text.', function () {
      return inspect(successPath)
        .then(() => assert.equal(this.stdout.output.length, 1))
    })

    it('Should find an open port.', function (done) {
      const server = net.createServer()
      server.listen(9229, () => inspect(successPath).then(done))
    })

    it('Should use path to local chromedriver instance.', function () {
      const paths = process.env['PATH'].split(':')
      const removeChromeDriver = _.remove((key) => {
        return key.includes('chromedriver') ||
          key.includes('inspect-process/node_modules/.bin')
      })

      process.env['PATH'] = removeChromeDriver(paths).join(':')
      return inspect(successPath)
    })

    it('Should respect --debug-brk nodeArg.', function (done) {
      const inspected = inspect(successPath, {
        nodeArgs: ['--debug-brk']
      })

      inspected.devtools.onOpen = function () {
        inspected.devtools._waitUntilPause()
          .then(() => inspected.devtools._continueExecution())
          .then(() => done())
      }
    })
  })

  /* ---------------------------------------------------------------------------
   * options
   * ------------------------------------------------------------------------ */

  describe('options', function () {
    it('Should debug exceptions (--debug-exception).', function (done) {
      const inspected = inspect(exceptionPath, {
        inspectOptions: { 'debug-exception': true }
      })

      inspected.devtools.onOpen = function () {
        inspected.devtools._waitUntilPause()
          .then(() => inspected.devtools._continueExecution())
          .then(() => done())
      }
    })
  })

  /* ---------------------------------------------------------------------------
   * executable
   * ------------------------------------------------------------------------ */

  describe('executable', function () {
    it('Should return with the child process success exitcode.', function (done) {
      const proc = spawn(executablePath, ['success'])

      proc.on('exit', () => {
        assert.equal(proc.exitCode, 0)
        done()
      })
    })

    it('Should return with the child process error exitcode.', function (done) {
      const proc = spawn(executablePath, ['error'])

      proc.on('exit', () => {
        assert.equal(proc.exitCode, 1)
        done()
      })
    })

    it('Should forward childArgs.', function (done) {
      const proc = spawn(executablePath, ['success', 'overwrite'])
      let output

      proc.stdout.on('data', (data) => (output = data.toString()))
      proc.on('exit', () => {
        assert.equal(output, 'overwrite')
        done()
      })
    })

    it('Should forward nodeArgs', function (done) {
      const proc = spawn(executablePath, ['--require', './test/fixtures/required', 'success'])
      let output = ''

      proc.stdout.on('data', (data) => (output = data.toString()))
      proc.on('exit', () => {
        assert.equal(output, 'required')
        done()
      })
    })

    it('Should forward v8flags', function (done) {
      const proc = spawn(executablePath, ['--harmony', 'harmony'])
      let output = ''

      proc.stdout.on('data', (data) => (output = data.toString()))
      proc.on('exit', () => {
        assert.equal(output, 'success')
        done()
      })
    })

    it('Should work with node aliases', function (done) {
      const proc = spawn(executablePath, ['-r', './test/fixtures/required', 'success'])
      let output = ''

      proc.stdout.on('data', (data) => (output = data.toString()))
      proc.on('exit', () => {
        assert.equal(output, 'required')
        done()
      })
    })

    it('Should forward inspectArgs', function (done) {
      const proc = spawn(executablePath, ['--log-level=verbose', 'success'])
      let output = ''

      proc.stderr.on('data', (data) => (output = data.toString()))
      proc.on('exit', () => {
        assert.notEqual(output, '')
        done()
      })
    })
  })
})
