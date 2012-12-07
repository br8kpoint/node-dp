/**
 * Module dependencies.
 */
var dputil = require('./dp-utils')
	, request = require('request')




module.exports.donor = require('./donor').Donor;

module.exports.gift = require('./gift').Gift;

module.exports.contact = require('./contact').Contact;

module.exports.credentials = dputil.credentials;

module.exports.nonQuery = function nonQuery(sql, callback){
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ callback(e, null)})
    parser.on('end', function(){ callback(null, true)}) // return true because we did not receive any text which indicates an error
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dputil.dpURI(sql)).pipe(parser)
}