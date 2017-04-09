/**
 * @module granax
 * @license AGPL-3.0
 * @author Gordon Hall <gordonh@member.fsf.org>
 */

'use strict';

/**
 * Returns a {@link TorController} with automatically constructed socket
 * @param {number} controlPort - Port to connect controller socket
 * @param {object} [controllerOptions] - @see {@link TorController}
 */
module.exports = function(controlPort, controllerOptions) {
  return new module.exports.TorController(
    require('net').connect(controlPort),
    controllerOptions
  );
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

/**
 * {@link module:signals}
 */
module.exports.signals = require('./lib/signals');
