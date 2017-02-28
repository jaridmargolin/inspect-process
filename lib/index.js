'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const path = require('path')
const spawn = require('child_process').spawn

// 3rd party
const _ = require('lodash')
const which = require('which')
const exitHook = require('exit-hook')
const portfinderSync = require('portfinder-sync')
const log = require('npmlog')

// lib
const Devtools = require('./devtools')
const Proxy = require('./proxy')

/* -----------------------------------------------------------------------------
 * inspect
 * -------------------------------------------------------------------------- */

module.exports = function (cmd, options) {
  options = _.defaults(options || {}, {
    inspectOptions: {},
    nodeArgs: [],
    childArgs: []
  })

  log.level = options['inspectOptions']['log-level'] || 'info'

  const devtoolsOptions = _.pick(options['inspectOptions'], ['debug-exception'])
  devtoolsOptions['debug-brk'] = options['nodeArgs'].includes('--debug-brk')

  const devtools = new Devtools(devtoolsOptions)
  return _.extend(inspectProcess(cmd, options, devtools), { devtools })
}

const inspectProcess = function (cmd, options, devtools) {
  const proxy = new Proxy()
  const proxyPort = portfinderSync.getPort(9229)
  const getPathToCmd = function (cmd) {
    try { return which.sync(cmd) } catch (e) { return path.resolve(cmd) }
  }

  return new Promise(function (resolve, reject) {
    process.env['FORCE_COLOR'] = 1

    const processPort = portfinderSync.getPort(proxyPort + 1)
    const debugArgs = ['--inspect=' + processPort, '--debug-brk']
    const nodeArgs = options['nodeArgs']
    const childArgs = options['childArgs']
    const args = nodeArgs.concat(debugArgs, [getPathToCmd(cmd)], childArgs)
    const proc = spawn('node', args)

    // we want esnure devtools creation/cleanup executes fully
    let devtoolsOpen
    let devtoolsClose

    const openDevtools = function () {
      const url = `chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:${proxyPort}`

      return proxy.start(proxyPort)
        .then(__ => proxy.addConnection(processPort))
        .then(__ => (devtoolsOpen = devtools.open(url)))
    }

    const closeDevtools = function () {
      return devtoolsOpen
        .then(__ => (devtoolsClose = devtools.close()))
        .then(__ => proxy.stop())
    }

    const onInspectComplete = function () {
      if (!devtoolsOpen) {
        return resolveWithResult()
      }

      return devtoolsClose
        ? devtoolsClose.then(resolveWithResult)
        : closeDevtools().then(resolveWithResult)
    }

    const resolveWithResult = function () {
      return proc.exitCode ? reject() : resolve()
    }

    proc.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    proc.stderr.on('data', (data) => {
      const dataStr = data.toString()
      const isListening = dataStr.startsWith('Debugger listening on port')
      const isAttached = dataStr.startsWith('Debugger attached')
      const isCompleted = dataStr.startsWith('Waiting for the debugger to disconnect')
      const isInspectOutput = isListening || isCompleted || isAttached

      if (isListening) {
        log.silly('process: listening')
        openDevtools()
      } else if (isCompleted && devtoolsOpen) {
        log.silly('process: completed')
        closeDevtools()
      } else if (isAttached) {
        log.silly('process: attached')
      }

      if (isInspectOutput) {
        log.verbose('debugger: ' + _.trim(data))
      } else {
        process.stderr.write(data)
      }
    })

    proc.once('exit', onInspectComplete)
    proc.once('SIGINT', onInspectComplete)
    proc.once('SIGTERM', onInspectComplete)

    // safegaurd to ensure processes are cleaned up on exit
    exitHook(() => {
      devtools.close()
      proc.kill()
    })
  })
}
