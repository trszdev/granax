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
  /* eslint max-statements: [2, 22] */
  let id = randomBytes(8).toString('hex');
  let granaxDir = path.join(tmpdir(), `granax-${userInfo().username}`);
  let dataDirectory = path.join(granaxDir, `${id}.d`);
  let torrcFile = path.join(granaxDir, id);
  let controlFilePath = path.join(dataDirectory, 'control-port');
  let torrcContent = [
    'AvoidDiskWrites 1',
    'SocksPort auto IPv6Traffic PreferIPv6 KeepAliveIsolateSOCKSAuth',
    'ControlPort auto',
    'CookieAuthentication 1'
  ];

  if (!Array.isArray(options)) {
    options = [options];
  }

  for (let block of options) {
    for (let property in block) {
      // NB: Don't push the DataDirectory until later so we can default it
      if (property === 'DataDirectory') {
        dataDirectory = block[property];
        controlFilePath = path.join(dataDirectory, 'control-port')
        continue;
      }
      torrcContent.push(`${property} ${block[property]}`);
    }
  }

  torrcContent.push(`DataDirectory ${dataDirectory}`);
  torrcContent.push(`ControlPortWriteToFile ${controlFilePath}`);
  mkdirp.sync(dataDirectory);
  writeFileSync(torrcFile, torrcContent.join('\n'));

  return [torrcFile, dataDirectory];
};
