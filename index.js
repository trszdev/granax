/**
 * @module granax
 * @license AGPL-3.0
 * @author Gordon Hall <gordonh@member.fsf.org>
 */

'use strict';

const path = require('path');
const childProcess = require('child_process');
const { spawn } = require('child_process');
const { platform } = require('os');
const { Socket } = require('net');
const { readFileSync } = require('fs');


/**
 * Returns a {@link TorController} with automatically constructed socket
 * to the local Tor bundle executable
 * @param {object} options
 * @returns {TorController}
 */
module.exports = function(options) {
  let socket = new Socket();
  let controller = new module.exports.TorController(socket, options);
  let tor = module.exports.tor(platform());
  let child = spawn(tor, ['-f', module.exports.torrc()], {
    cwd: path.join(__dirname, 'bin')
  });
  let directory = path.join(__dirname, 'bin/.tor');
  let portFileReads = 0;

  function connect() {
    let port = null;

    try {
      port = parseInt(readFileSync(path.join(
        directory,
        'control-port'
      )).toString().split(':')[1]);
    } catch (err) {
      portFileReads++;

      if (portFileReads <= 20) {
        return setTimeout(() => connect(), 1000);
      } else {
        return controller.emit('error',
                               new Error('Failed to read control port'));
      }
    }

    socket.connect(port);
  }

  process.on('exit', () => child.kill());
  child.stdout.once('data', () => setTimeout(() => connect(), 1000));
  child.on('error', (err) => controller.emit('error', err));
  controller.once('ready', () => controller.takeOwnership());

  return controller;
};

/**
 * Returns the local path to the tor bundle
 * @returns {string}
 */
module.exports.tor = function(platform) {
  switch (platform) {
    case 'win32':
      return path.join(__dirname, '$_OUTDIR', 'Browser', 'TorBrowser',
                       'Tor', 'tor.exe');
    case 'darwin':
      return path.join(__dirname, '.tbb.app', 'TorBrowser', 'Tor', 'tor');
    case 'linux':
      try {
        return childProcess.execFileSync('which', ['tor']).toString().trim();
      } catch (err) {
        throw new Error('Tor is not installed');
      }
      break;
      // return path.join(__dirname, 'tor-browser_en-US', 'Browser',
      //                  'TorBrowser', 'Tor', 'tor');
    default:
      throw new Error('Unsupported platform');
  }
};

/**
 * {@link TorController}
 */
module.exports.TorController = require('./lib/controller');

/**
 * {@link module:granax/commands}
 */
module.exports.commands = require('./lib/commands');

/**
 * {@link module:granax/replies}
 */
module.exports.replies = require('./lib/replies');

/**
 * {@link module:granax/torrc}
 */
module.exports.torrc = require('./lib/torrc');
