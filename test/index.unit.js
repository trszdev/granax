'use strict';

const proxyquire = require('proxyquire');
const { expect } = require('chai');
const stream = require('stream');


describe('@module granax', function() {

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

});
