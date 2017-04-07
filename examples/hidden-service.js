'use strict';

const http = require('http');
const granax = require('..');
const tor = granax(9051);
const server = http.createServer((req, res) => res.end('hello, tor!'));

tor.on('ready', function() {
  server.listen(9555, '127.0.0.1');
  tor.createHiddenService('127.0.0.1:9555', (err, result) => {
    if (err) {
      tor.socket.close();
      console.error(err);
    } else {
      console.info(
        `service online! navigate to ${result.serviceId}.onion in tor browser!`
      );
    }
  });
});

tor.on('error', function(err) {
  tor.socket.close();
  console.error(err);
});
