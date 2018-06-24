# bip65
[![NPM Package](https://img.shields.io/npm/v/bip65.svg?style=flat-square)](https://www.npmjs.org/package/bip65)
[![Build Status](https://img.shields.io/travis/bitcoinjs/bip65.svg?branch=master&style=flat-square)](https://travis-ci.org/bitcoinjs/bip65)
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

A [BIP65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) absolute lock-time encoding library.


## Example
``` javascript
let bip65 = require('bip65')

bip65.encode({ utc: 102 })
// => TypeError: Expected Number utc >= 500000000

bip65.encode({ blocks: 1517448381 })
// => TypeError: Expected Number Blocks < 500000000

bip65.encode({ blocks: 54 })
// => 0x00000036

bip65.encode({ blocks: 200 })
// => 0x000000c8

bip65.decode(0x00000036)
// => { blocks: 54 }
```


## LICENSE [ISC](LICENSE)
