/**
 * Module dependencies.
 */

var events = require('events')
    , request = require('request')
    , check = require('validator').check;

/**
* Represents a donor from donor perfect
*@constructor
*@this {Donor}
*/
function Donor(){
    var self = this;

	this.donor_id = 0; // new donor
	this.first_name = "";
	this.last_name = "";
	this.middle_name = "";
	this.suffix = "";
	this.title = "";
	this.salutation = "";
	this.prof_title = "";
    this.opt_line = "";    
    this.address = "";    
    this.address2 = "";    
    this.city = "";    
    this.state = "";    
    this.zip = "";    
    this.country = "";    
    this.address_type = "";    
    this.home_phone = "";    
    this.business_phone = "";    
    this.fax_phone = "";    
    this.mobile_phone = "";    
    this.email = "";    
    this.org_rec = "";    
    this.donor_type = "IN";     // set donor as individual by default
    this.nomail = "N";          // everybody gets mail by default
    this.nomail_reason = "";    
    this.narrative = "";    
    this.user_id = module.exports.credentials.username;     // set user to node-dp username
    this.other_state_prov = "";
    this.ccInfo = {};
    this.local_id = 0;
    this.udfFields = {}

}
/**
* Saves a donor to donor perfect
*@param callback the callback to fire once finished saving
*@this {Donor}
*/
Donor.prototype.save = function (callback){
    this.validate();
    var params = [ this.donor_id
        , this.first_name
        , this.last_name
        , this.middle_name
        , this.suffix
        , this.title
        , this.salutation
        , this.prof_title
        , this.opt_line
        , this.address
        , this.address2
        , this.city
        , this.state
        , this.zip
        , this.country
        , this.address_type
        , this.home_phone
        , this.fax_phone
        , this.business_phone
        , this.fax_phone
        , this.mobile_phone
        , this.email
        , this.org_rec
        , this.donor_type
        , this.nomail
        , this.nomail_reason
        , this.narrative
        , this.user_id
    ]
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        callback(e, this)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field') this.donor_id = parseInt(n.attributes.value);
    })
    parser.on('end', function(){
        callback(false, this);
    })
    request(dpURI('dp_savedonor', params)).pipe(parser)
}

/**
* Check to see if the donor has been saved or not
*@returns true if the donor has not been saved, false if the donor is not new
*/
Donor.prototype.isNew = function(){
    return this.donor_id !== 0;
}

Donor.prototype.validate = function(){
    check(this.email, 'Please enter a valid email address.').isEmail();
    check(this.first_name, 'Please enter a valid first name.').notNull().len(1, 100);
    check(this.last_name, 'Please enter a valid last name.').notNull().len(1,150);
    check(this.address, 'Please enter a valid address.').notNull().len(1, 100);
    check(this.city, 'Please enter a valid city.').notNull().len(1, 75);
    check(this.state, 'Please enter a valid state or province.').notNull().len(1, 50);
    check(this.country, 'Please select a valid country.').notNull().len(1, 50);

}
/**
* Retrieves a donor or donors from donor perfect
*@param {number|[numbers]|string} ids - number is a single id, numbers is an array of ids, string is an sql query
*@param {callback} callback = called to pass back results 
*@static
*/
Donor.get = function(ids, callback){
    if(typeof ids === 'number') getByID(ids, callback);
    if(ids instanceof Array) getByArray(ids, callback);
    if(typeof ids === 'string') getBySql(ids, callback);
}

Donor.handleSaxError = function(e, context){

}

/**
* Handle the open tag event of the sax parser. If the node is a field it will add the value to the object.
* If it is a result it will create a new donor object and push it to the context array
*@param {sax node} n the node that was parsed by sax
*@param {Array} context the array of donors
*/
Donor.handleSaxOpenTag = function(n, context){
    if(n.name === 'field'){
        // get last item in context and save value
        var donor = context[context.length - 1]
        if(n.attributes.name in donor) donor[n.attributes.name] = n.attributes.value;
        else donor.udfFields[n.attributes.name] = n.attributes.value;
    }
    if(n.name === "record") context.push(new Donor())
}


function getByID(ids, callback){
    var sql = "select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id = " + ids;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ Donor.handleSaxError(e, donors)})
    parser.on('opentag', function(n){Donor.handleSaxOpenTag(n, donors)})
    parser.on('end', function(){ callback(donors[0])}) // return the one and only donor specified by the id
    console.log('getting donor:' + ids)
    request(dpURI(sql)).pipe(parser)
}

function getByArray(ids, callback){
    var sql = "select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id in (" + ids.join() + ")";
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ Donor.handleSaxError(e, donors)})
    parser.on('opentag', function(n){Donor.handleSaxOpenTag(n, donors)})
    parser.on('end', function(){ callback(donors)}) // return the one and only donor specified by the id
    request(dpURI(sql)).pipe(parser)
}

function getBySql(ids, callback){
    var sql = ids
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ Donor.handleSaxError(e, donors)})
    parser.on('opentag', function(n){Donor.handleSaxOpenTag(n, donors)})
    parser.on('end', function(){ callback(donors)}) // return the one and only donor specified by the id
    request(dpURI(sql)).pipe(parser)
}

function dpURI(action, params){
    var uri =  "https://interland8.donorperfect.net/prod/xmlrequest.asp?action=" + action;
    if(params !== undefined){
      uri += '&params='; 
      var strParams = "" 
      for(var i = 0; i < params.length; i++){
        switch(typeof params[i]){
            case 'string':
                strParams += "'" + params[i] + "',"
                break;
            case 'number':
                strParams += params[i] + ",";
                break;
            default:
                if(params[i] === null) strParams += "null,"             // param is null
                else strParams += "'" + params[i].toString() + "'"      // try and use toString

        }
      }
      strParams = strParams.replace(/(^\s*,)|(,\s*$)/g, '');
      uri += strParams
    } 
    uri += "&login=" + module.exports.credentials.username;
    uri += "&pass=" + module.exports.credentials.password;
    console.log(uri)
    return uri;
}

module.exports.donor = Donor;

module.exports.credentials = {"username": "username", "password":"password"};