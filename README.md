Granax
======

[![Build Status](https://img.shields.io/travis/bookchin/granax/master.svg?style=flat-square)](https://travis-ci.org/bookchin/granax)
[![Coverage Status](https://img.shields.io/coveralls/bookchin/granax.svg?style=flat-square)](https://coveralls.io/r/bookchin/granax)
[![NPM](https://img.shields.io/npm/v/granax.svg?style=flat-square)](https://www.npmjs.com/package/granax)

Complete client implementation of the [Tor Control Protocol](https://gitweb.torproject.org/torspec.git/plain/control-spec.txt). 
Control a running Tor instance from Node.js!

Usage
-----

Install via NPM:

```
npm install granax --save
```

Make sure that `ControlPort=9051` (or your preferred port) is set in your 
`torrc`, then you may open the control socket and issue commands:

```js
const tor = require('granax')(9051, options);

tor.on('ready', function() {
  tor.createHiddenService('127.0.0.1:8080', {
    virtualPort: 80, // default
    keyType: 'NEW', // default
    keyBlob: 'BEST' // default
  }, (err, serviceId, privateKey) => {
    console.info(`Service URL: ${serviceId}.onion`);
    console.info(`Private Key: ${privateKey}`);
  });
});

tor.on('error', function(err) {
  console.error(err);
});
```

> Note that if using cookie authentication, the Node.js process must have the 
> appropriate privileges to read the cookie file. Usually, this means running 
> as the same user that is running Tor.

Resources
---------

* [Granax Documentation](http://bookch.in/granax)
* [Tor Control Specification](https://gitweb.torproject.org/torspec.git/plain/control-spec.txt)
* [Tor Documentation](https://www.torproject.org/docs/documentation.html.en)

License
-------

Granax - Complete client implementation of the Tor Control Protocol  
Copyright (C) 2017 Gordon Hall

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


