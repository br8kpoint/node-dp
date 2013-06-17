/**
 * Module dependencies.
 */
var dputil = require('./dp-utils')
	, request = require('request')




module.exports.donor = require('./donor').Donor;

module.exports.gift = require('./gift').Gift;

module.exports.contact = require('./contact').Contact;

module.exports.dputils = dputil

module.exports.credentials = dputil.credentials;

module.exports.executeNonQuery = dputil.executeNonQuery

module.exports.executeScalar = dputil.executeScalar