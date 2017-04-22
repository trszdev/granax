'use strict';

const proxyquire = require('proxyquire');
const { expect } = require('chai');
const stream = require('stream');


describe('@module granax', function() {

  describe('@exports', function() {

    it('should export a function that returns a TorController', function() {
      let sock = new stream.Duplex({
        read: () => null,
        write: () => null
      });
      let granax = proxyquire('..', {
        net: {
          connect: () => sock
        }
      });
      let tor = granax('tor.sock', { authOnConnect: false });
      expect(tor).to.be.instanceOf(granax.TorController);
    });

    it.skip('should connect on stdout from child', function() {

    });

    it.skip('should bubble child error on controller', function() {

    });

    it.skip('should take ownership on ready', function() {

    });

    it.skip('should kill child on process exit', function() {

    });

  });

  describe('@function tor', function() {

    it.skip('should return the windows path', function() {

    });

    it.skip('should return the macintosh path', function() {

    });

    it.skip('should return the gnu+linux path', function() {

    });

  });

});
