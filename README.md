![Granax](https://nodei.co/npm/granax.png?downloads=true)
=========================================================

[![Build Status](https://img.shields.io/travis/bookchin/granax/master.svg?style=flat-square)](https://travis-ci.org/bookchin/granax) | 
[![Coverage Status](https://img.shields.io/coveralls/bookchin/granax.svg?style=flat-square)](https://coveralls.io/r/bookchin/granax) | 
[![NPM](https://img.shields.io/npm/v/granax.svg?style=flat-square)](https://www.npmjs.com/package/granax)

Complete client implementation of the [Tor Control Protocol](https://gitweb.torproject.org/torspec.git/plain/control-spec.txt). 
Control a running Tor instance from Node.js!

Usage
-----

Install via NPM:

```
npm install granax --save
```

As part of the installation process, Granax will download the Tor Browser 
Bundle local to itself and use the included Tor executable.

```js
const tor = require('granax')();

tor.on('ready', function() {
  tor.createHiddenService('127.0.0.1:8080', (err, result) => {
    console.info(`Service URL: ${result.serviceId}.onion`);
    console.info(`Private Key: ${result.privateKey}`);
  });
});

tor.on('error', function(err) {
  console.error(err);
});
```

### Using System Tor Installation

Make sure that `ControlPort=9051` (or your preferred port) is set in your 
`torrc`, then you may open the control socket and issue commands:

```js
const { connect } = require('net');
const { TorController } = require('granax');
const tor = new TorController(connect(9051), options);

tor.on('ready', function() {
  // party!
});
```

> Note that if using cookie authentication, the Node.js process must have the 
> appropriate privileges to read the cookie file. Usually, this means running 
> as the same user that is running Tor.

Resources
---------

* [Granax Source](https://github.com/bookchin/granax)
* [Granax Examples](https://github.com/bookchin/granax/tree/master/examples)
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


