/**
 * Module dependencies.
 */
var dputil = require('./dp-utils')
	, request = require('request');
	

	require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });


module.exports.donor = require('./donor').Donor;

module.exports.gift = require('./gift').Gift;

module.exports.otherInfo = require('./other').OtherInfo;

module.exports.contact = require('./contact').Contact;

module.exports.flag = require('./flag').Flag;

module.exports.dputils = dputil;

module.exports.credentials = dputil.credentials;

module.exports.executeNonQuery = dputil.executeNonQuery;

module.exports.executeScalar = dputil.executeScalar;
module.exports.settings = dputil.settings;