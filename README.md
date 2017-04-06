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

Open the control socket and issue commands:

```js
const granax = require('granax');
const tor = granax(9051); // Tor's ControlPort

// TODO 
```

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


