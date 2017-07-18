/**
 * @module granax/torrc
 */

'use strict';

const path = require('path');
const mkdirp = require('mkdirp');
const { randomBytes } = require('crypto');
const { userInfo, tmpdir } = require('os');
const { writeFileSync } = require('fs');


/**
 * Generates a usable torrc file, writes it to temp storage and then returns
 * the path to the file
 * @param {object} options
 * @returns {string}
 */
module.exports = function(options = {}) {
  let id = randomBytes(8).toString('hex');
  let granaxDir = path.join(tmpdir(), `granax-${userInfo().username}`);
  let dataDirectory = path.join(granaxDir, `${id}.d`);
  let torrcFile = path.join(granaxDir, id);
  let controlFilePath = path.join(dataDirectory, 'control-port');
  let logFile = path.join(dataDirectory, 'debug.log');
  let torrcContent = [
    'AvoidDiskWrites 1',
    'SocksPort auto IPv6Traffic PreferIPv6 KeepAliveIsolateSOCKSAuth',
    'ControlPort auto',
    `ControlPortWriteToFile ${controlFilePath}`,
    'CookieAuthentication 1',
    'DirReqStatistics 0',
    'HiddenServiceStatistics 0',
    `DataDirectory ${dataDirectory}`,
    `Log debug file ${logFile}`
  ];

  for (let prop in options) {
    torrcContent.push(`${prop} ${options[prop]}`);
  }

  mkdirp.sync(dataDirectory);
  writeFileSync(torrcFile, torrcContent.join('\n'));

  return [torrcFile, dataDirectory];
};
