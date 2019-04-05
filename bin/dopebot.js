#!/usr/bin/env node

//
// This executable sets up the environment and runs the dopebot.
//

'use strict'

process.title = 'dopebot'

// Find the dopebot lib
var path = require('path')
var fs = require('fs')
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib')

// Run dopebot
require(lib + '/cli')()
