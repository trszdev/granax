'use strict';

const crypto = require('crypto');
const async = require('async');
const { Transform: TransformStream } = require('stream');
const merge = require('merge');
const assert = require('assert');
const net = require('net');
const { readFileSync } = require('fs');
const { EventEmitter } = require('events');
const commands = require('./commands');
const replies = require('./replies');


/**
 * Represents a Tor controller for issuing commands
 */
class TorController extends EventEmitter {

  static get CLIENT_HASH() {
    return 'Tor safe cookie authentication controller-to-server hash';
  }

  static get SERVER_HASH() {
    return 'Tor safe cookie authentication server-to-controller hash';
  }

  /**
   * Fired when the underlying socket encounters an error
   * @event TorController#error
   * @type {error}
   */

  /**
   * Fires when the controller is authenticated and ready to send commands
   * @event TorController#ready
   */

  /**
   * Fires when the underlying socket closes
   * @event TorController#close
   */

  static get DEFAULTS() {
    return {
      authOnConnect: true
    };
  }

  /**
   * @constructor
   * @param {Socket} socket - net.Socket connected to Tor's control port
   * @param {object} [options]
   *
   */
  constructor(socket, options) {
    super();
    assert(socket instanceof net.Socket, 'Invalid net.Socket supplied');

    this._opts = merge(TorController.DEFAULTS, options);
    this._stack = [];

    this.socket = socket
      .on('connect', () => this._handleConnect())
      .on('error', (err) => this._handleError(err))
      .on('close', () => this._handleClose());

    this.socket.pipe(this._createReplySplitter())
      .on('data', (data) => this._handleReply(data));
  }

  /**
   * Handles authentication upon socket connection
   * @private
   */
  _handleConnect() {
    if (!this._opts.authOnConnect) {
      return this.emit('ready');
    }

    const clientNonce = crypto.randomBytes(32).toString('hex');

    async.waterfall([
      (next) => this._getAuthCookie(next),
      (cookie, authTypes, next) => {
        if (authTypes.includes('SAFECOOKIE')) {
          this.getAuthChallenge(clientNonce, (err, result) => {
            next(err, result, cookie)
          });
        } else {
          next(null, {}, cookie);
        }
      },
      ({ hash, nonce }, cookie, next) => {
        if (!(hash && nonce)) {
          return this.authenticate(cookie, next);
        }

        this.authenticate(this._createChallengeResponse(
          cookie,
          clientNonce,
          nonce,
          hash
        ), next);
      }
    ], (err) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('ready');
      }
    });
  }

  /**
   * Handles errors on the underlying socket and bubbles them
   * @private
   * @param {object} error
   */
  _handleError(err) {
    this.emit('error', err);
  }

  /**
   * Creates a message splitter from incoming socket data
   * @private
   */
  _createReplySplitter() {
    return new TransformStream({
      objectMode: true,
      transform: function(data, enc, next) {
        let reply = [];
        let lines = data.toString().split('\r\n');

        for (let line of lines) {
          reply.push(line);

          if (line[3] === ' ') {
            this.push(reply);
            reply = [];
          }
        }

        next(null);
      }
    });
  }

  /**
   * Handles message processing and parsing from the socket
   * @private
   * @param {buffer} data
   */
  _handleReply(data) {
    let code = parseInt(data[0].substr(0, 3));
    let lines = data
      .filter((line) => !!line)
      .map((line) => line.substr(4).trim());

    switch (code.toString()[0]) {
      case '2':
        let { method, callback } = this._stack.pop();
        let parsed = replies[method]
                   ? replies[method](lines)
                   : lines;
        callback(null, parsed);
        break;
      case '4':
      case '5':
        this._stack.pop().callback(new Error(lines[0]));
        break;
      case '6':
      default:
        // TODO: Handle async events
    }
  }

  /**
   * Handles socket close event and bubbles it
   * @private
   */
  _handleClose() {
    this.emit('close');
  }

  /**
   * Send an arbitrary command and pass response to callback
   * @private
   * @param {string} command
   * @param {function} callback
   */
  _send(command, callback) {
    this._stack.unshift({ method: command.split(' ')[0], callback });
    this.socket.write(`${command}\r\n`);
  }

  /**
   * Load the authentication cookie
   * @private
   * @param {TorController~_getAuthCookieCallback} callback
   */
  _getAuthCookie(callback) {
    this.getProtocolInfo((err, info) => {
      if (err) {
        return callback(err);
      }

      try {
        callback(
          null,
          readFileSync(info.auth.cookieFile).toString('hex'),
          info.auth.methods
        );
      } catch (err) {
        callback(err);
      }
    });
  }
  /**
   * @callback TorController~_getAuthCookieCallback
   * @param {object|null} error
   * @param {string} cookie
   * @param {string[]} authTypes
   */

  /**
   * Creates the challenge response from a SAFECOOKIE challenge
   * @param {string} cookie - The secret cookie string
   * @param {string} clientNonce - Client nonce sent with auth challenge
   * @param {string} serverNonce - Server nonce reply from auth challenge
   * @returns {string}
   */
  _createChallengeResponse(cookie, clientNonce, serverNonce) {
    return crypto.createHmac('sha256', TorController.CLIENT_HASH)
      .update(Buffer.concat([
        Buffer.from(cookie, 'hex'),
        Buffer.from(clientNonce, 'hex'),
        Buffer.from(serverNonce, 'hex')
      ]))
      .digest('hex');
  }

  /**
   * Authenticates with the control port given the supplied param
   * @param {string} token
   * @param {TorController~authenticateCallback} callback
   */
  authenticate(token, callback) {
    this._send(commands.AUTHENTICATE(token), callback);
  }

  /**
   * Requests an authentication challenge from tor
   * @param {string} nonce - Client nonce for authenticating
   * @param {TorController~getAuthChallengeCallback} callback
   */
  getAuthChallenge(nonce, callback) {
    this._send(commands.AUTHCHALLENGE(nonce), callback);
  }
  /**
   * @callback TorController~getAuthChallengeCallback
   * @param {object|null} error
   * @param {AuthChallengeResult} result
   */

  /**
   * Ask tor for general information
   * @param {TorController~getProtocolInfoCallback} callback
   */
  getProtocolInfo(callback) {
    this._send(commands.PROTOCOLINFO(), callback);
  }
  /**
   * @callback TorController~getProtocolInfoCallback
   * @param {object|null} error
   * @param {ProtocolInfoResult} result
   */

  /**
   * Establishes a hidden service on the given target
   * @param {string} target - The target ip:port string
   * @param {object} [options] - {@link module:commands#ADD_ONION}
   * @param {TorController~createHiddenServiceCallback} callback
   */
  createHiddenService(target, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    this._send(commands.ADD_ONION(target, options), callback);
  }
  /**
   * @callback TorController~createHiddenServiceCallback
   * @param {object|null} error
   * @param {AddOnionResult} result
   */

  /**
   * Takes down a running hidden service owned by this controller
   * @param {string} serviceId - Tor hidden service ID
   * @param {TorController~destroyHiddenServiceCallback} callback
   */
  destroyHiddenService(serviceId, callback) {
    this._send(commands.DEL_ONION(serviceId), callback);
  }
  /**
   * @callback TorController~destroyHiddenServiceCallback
   * @param {object|null} error
   */

}

module.exports = TorController;
