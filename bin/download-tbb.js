'use strict';

const TOR_VERSION = '6.5.2';

const fs = require('fs');
const { request } = require('https');
const ncp = require('ncp');
const _7z = require('7zip')['7z'];
const path = require('path');
const childProcess = require('child_process');
const os = require('os');
const { tor: getTorPath } = require('..');


/**
 * Get the platform specific download like for TBB by version
 * @param {string} platform
 * @param {string} version
 * @returns {string}
 */
exports.getTorBrowserLink = function(platform, version) {
  const v = version || TOR_VERSION;
  const link = `https://dist.torproject.org/torbrowser/${v}`;

  switch (platform) {
    case 'win32':
      return `${link}/torbrowser-install-${v}_en-US.exe`;
    case 'darwin':
      return `${link}/TorBrowser-${v}-osx64_en-US.dmg`;
    case 'linux':
      return os.arch() === 'x64'
        ? `${link}/tor-browser-linux64-${v}_en-US.tar.xz`
        : `${link}/tor-browser-linux32-${v}_en-US.tar.xz`
    default:
      throw new Error(`Unsupported platform "${platform}"`);
  }
};

/**
 * Downloads the package to the given directory
 * @param {string} link
 * @param {string} target
 * @param {function} callback
 */
exports.downloadTorBrowserBundle = function(link, target, callback) {
  request(link, (res) => {
    res.pipe(fs.createWriteStream(target))
      .on('finish', callback)
      .on('error', callback);
  }).end();
};

/**
 * Unpacks the package at the given path based on platform and callback with
 * the path to the tor executable
 * @param {string} bundle
 * @param {function} callback
 */
exports.unpackTorBrowserBundle = function(bundle, callback) {
  switch(path.extname(bundle)) {
    case '.exe':
      return exports._unpackWindows(bundle, callback);
    case '.dmg':
      return exports._unpackMacintosh(bundle, callback);
    case '.xz':
      return exports._unpackLinux(bundle, callback);
    default:
      throw new Error('Unsupported bundle type');
  }
};

/**
 * @private
 */
exports._unpackWindows = function(bundle, callback) {
  const extract = childProcess.spawn(_7z, [
    'x',
    path.join(__dirname, '.tbb.exe')
  ], { cwd: __dirname });

  extract.on('close', (code) => {
    callback(code >= 0 ? null : new Error('Failed to unpack bundle'),
             getTorPath('win32'));
  });
};

/**
 * @private
 */
exports._unpackMacintosh = function(bundle, callback) {
  const extract = childProcess.spawn('hdiutil', [
    'attach',
    '-mountpoint',
    path.join(__dirname, '.tbb'),
    path.join(__dirname, '.tbb.dmg')
  ], { cwd: __dirname });

  extract.on('close', (code) => {
    if (code < 0) {
      return callback(new Error('Failed to unpack bundle'));
    }

    ncp.ncp(
      path.join(__dirname, '.tbb', 'TorBrowser.app'),
      path.join(__dirname, '.tbb.app'),
      (err) => {
        if (err) {
          return callback(new Error('Failed to unpack bundle'));
        }

        extract = childProcess.spawn('hdiutil', [
          'detach',
          path.join(__dirname, '.tbb')
        ], { cwd: __dirname });

        extract.on('close', (code) => {
          if (code < 0) {
            callback(new Error('Failed to unpack bundle'));
          }

          callback(null, getTorPath('darwin'));
        });
      }
    );
  });
};

/**
 * @private
 */
exports._unpackLinux = function(bundle, callback) {
  const extract = childProcess.spawn('tar', [
    'xJf',
    path.join(__dirname, '.tbb.xz')
  ], { cwd: __dirname });

  if (process.env.GRANAX_VERBOSE) {
    extract.stdout.pipe(process.stdout);
    extract.stderr.pipe(process.stderr);
  }

  extract.on('close', (code) => {
    callback(code <= 0 ? null : new Error('Failed to unpack bundle'),
             getTorPath('linux'));
  });
};

/**
 * Detects the platform and installs TBB
 * @param {function} callback
 */
exports.install = function(callback) {
  let link = exports.getTorBrowserLink(os.platform());
  let basename = null;

  console.log(`Downloading Tor Bundle from ${link}...`);

  switch (os.platform()) {
    case 'win32':
      basename = '.tbb.exe';
      break;
    case 'darwin':
      basename = '.tbb.dmg';
      break;
    case 'linux':
      console.log('Skipping automatic Tor install on GNU+Linux!');
      console.log('Be sure to install Tor using your system package manager.');
      return;
      // basename = '.tbb.xz';
      break;
    default:
      throw new Error('Unsupported platform');
  }

  basename = path.join(__dirname, basename);

  exports.downloadTorBrowserBundle(link, basename, (err) => {
    if (err) {
      return callback(err);
    }

    console.log(`Unpacking Tor Bundle into ${__dirname}...`);
    exports.unpackTorBrowserBundle(basename, callback);
  });
};

if (!module.parent) {
  exports.install((err) => {
    if (err) {
      console.log(err.message);
      process.exit(1);
    } else {
      console.log('Finished!')
      process.exit(0);
    }
  });
}
