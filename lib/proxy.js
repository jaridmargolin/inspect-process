'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const WebSocket = require('ws')
const axios = require('axios')

/* -----------------------------------------------------------------------------
 * Proxy
 * -------------------------------------------------------------------------- */

module.exports = class Proxy {

  constructor (port) {
    this.proxy = null
    this.connections = {}
  }

  start (port) {
    return new Promise((resolve, reject) => {
      this.proxy = new WebSocket.Server({ port }, __ => resolve(this))
      this.proxy.on('connection', frontend => this.listenToFrontend(frontend))
    })
  }

  listenToFrontend (frontend) {
    frontend.on('message', (...args) => this.forwardToConnections(...args))
    frontend.on('close', __ => this.closeAllConnections())
  }

  addConnection (port) {
    return axios.get(`http://localhost:${port}/json/list`)
      .then(res => res.data[0]['webSocketDebuggerUrl'])
      .then(url => this.createConnection(port, url))
  }

  createConnection (key, url) {
    return new Promise((resolve, reject) => {
      const connection = this.connections[key] = new WebSocket(url)
      connection.on('open', __ => resolve(connection))
      connection.on('message', (...args) => this.forwardToFrontend(...args))
    })
  }

  closeAllConnections () {
    return Promise.all(_.map(this.connections, connection => connection.close()))
  }

  closeConnection (key) {
    return new Promise((resolve, reject) => {
      this.connections[key].close(err => err ? reject(err) : resolve())
    })
  }

  forwardToConnections (msg, options) {
    _.each(this.connections, connection => connection.send(msg, options))
  }

  forwardToFrontend (msg, options) {
    this.proxy.clients.forEach(client => client.send(msg, options))
  }

  stop () {
    return this.proxy.close()
  }

}
