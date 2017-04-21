/**
 * @module granax
 * @license AGPL-3.0
 * @author Gordon Hall <gordonh@member.fsf.org>
 */

'use strict';

const { getTorPath } = require('../bin/download-tbb');


/**
 * Returns a {@link TorController} with automatically constructed socket
 * to the local Tor bundle executable
 * @returns {TorController}
 */
module.exports = function() {

};

/**
 * {@link TorController}
 */
module.exports.TorController = require('./lib/controller');

/**
 * {@link module:commands}
 */
module.exports.commands = require('./lib/commands');

/**
 * {@link module:replies}
 */
module.exports.replies = require('./lib/replies');
