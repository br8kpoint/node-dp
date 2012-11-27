var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'mfair01'
nodedp.credentials.password= 'mfair01'

require('./donors')
require('./gifts')