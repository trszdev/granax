'use strict';

const path = require('path');
const mkdirp = require('mkdirp');
const { randomBytes } = require('crypto');
const { tmpdir } = require('os');
const { writeFileSync } = require('fs');


/**
 * Generates a usable torrc file, writes it to temp storage and then returns
 * the path to the file
 * @returns {string}
 */
module.exports = function() {
  let dataDirectory = path.join(__dirname, '../bin/.tor');
  let controlFilePath = path.join(dataDirectory, 'control-port');
  let torrcContent = [
    'AvoidDiskWrites 1',
    'Log notice stderr',
    'SocksPort auto IPv6Traffic PreferIPv6 KeepAliveIsolateSOCKSAuth',
    'ControlPort auto',
    `ControlPortWriteToFile ${controlFilePath}`,
    'CookieAuthentication 1',
    'DirReqStatistics 0',
    'HiddenServiceStatistics 0',
    `DataDirectory ${dataDirectory}`
  ].join('\n');
  let torrcFileName = 'granax-' + randomBytes(8).toString('hex');
  let writePath = path.join(tmpdir(), torrcFileName);

  mkdirp.sync(dataDirectory);
  writeFileSync(writePath, torrcContent);

  return writePath;
};
