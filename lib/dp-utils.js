var request = require('request').defaults({ timeout: 20000 }) /* DP normally answers in < 1 s; a stalled connection must become an error, not a hung caller */,
    moment = require('moment');

// set en-us mask

//dateFormat.masks.en_us = "m/d/yyyy h:MM:ss TT";

//changed above on 03/14/2013 because dp can't handle times in date
//dateFormat.masks.en_us = "m/d/yyyy";

/********************************************************************************************************************************
*
* Utilities
*
********************************************************************************************************************************/
function dpURI(action, params){
    action = encodeURIComponent(action)
    if(module.exports.settings.debug)console.log(action)
    var uri =  "https://www.donorperfect.net/prod/xmlrequest.asp?action=" + action;
    if(params !== undefined){
      uri += '&params='; 
      var strParams = "" 
      for(var i = 0; i < params.length; i++){
        switch(typeof params[i]){
            case 'string':
                if(params[i] == "null") strParams += encodeURIComponent(params[i]) + ",";
                else strParams += "'" + encodeURIComponent(params[i]).replace(/'/g, "''") + "',"
                break;
            case 'number':
                strParams += encodeURIComponent(params[i]) + ",";
                break;
            default:
                if(params[i] === null || params[i] === undefined) strParams += "null,"             // param is null
                else if (params[i] instanceof Date) strParams += "'" + encodeURIComponent(moment(params[i]).toISOString()) + "',";
                else strParams += "'" + encodeURIComponent(params[i].toString()).replace(/'/g, "''") + "',"      // try and use toString

        }
      }
      strParams = strParams.replace(/(^\s*,)|(,\s*$)/g, '');
      uri += strParams
    } 
    uri += "&login=" + module.exports.credentials.username;
    uri += "&pass=" + module.exports.credentials.password;
    if(module.exports.settings.debug) console.log(uri)
    return uri;
}

module.exports.dpURI = dpURI;
module.exports.credentials = {"username": "username", "password":"password"};
module.exports.settings = {debug : false, sendgrid_pass:""};
/**
  Builds the sql clause minus the select portion
**/
module.exports.buildSql = function(options, joinmap){
  try
    {
        var from = options.from;
        var where = " where ";
        var orderBy = options.orderBy
        //if(options.criteria.length == 0) where = "";
        options.criteria.forEach(function(el){
            //push source to from if it's not in there already
            if(from.indexOf(el.field.source) === -1) from.push(el.field.source);
            if(el.opperand === "LIKE" || el.opperand === "NOT LIKE"){
                el.value = "%" + el.value + "%"
            }
            if(el.opperand === "ENDSWITH"){
                el.opperand = "LIKE"
                el.value = "%" + el.value
            }
            if(el.opperand === "STARTSWITH"){
                el.opperand = "LIKE"
                el.value =  el.value + "%"
            }
            //el.value = el.value.replace(/%/g, "%25")
            if(isQuotable(el.field)){
                where += [el.field.source, el.field.name].join(".") + " " + el.opperand + " '" + el.value.replace("'", "''") + "' and "
            } else {
                where += [el.field.source, el.field.name].join(".") + " " + el.opperand + " " + el.value + " and "
            }
        })
        //strip last and if there was criteria
        if(options.criteria.length > 0) where = where.substring(0, where.length - 4)

        // add extra where from options
        if(options.hasOwnProperty("where")){
            if(options.where.toLowerCase().trim().indexOf("and") == 0){
                where += options.where;
            }
            else if(options.where.toLowerCase().trim().indexOf("or") == 0){
                where += options.where;
            }
            else{
                if(options.criteria.length == 0)
                    where +=  options.where;
                else
                    where += " and " + options.where;
            }
        }

        // add extra "from" from options 
        if(options.from){
            options.from.forEach(function(el){
                if(from.indexOf(el) === -1) from.push(el);
            })
        }
        if(options.where || options.criteria.length) where += " and ";
        where +=  buildJoins(from, joinmap);
        var sql = from.join(", ") + where;
        return sql;
    }
    catch(err)
    {
        throw err;
    }
}

/**
* Send a scalar query asynchronously to dp. Typically this will be a count query to count records.
* @param {string} sql - The scalar sql query to execute
* @param {function(err, total)} callback - function to call when finished or an error occurrs. 
*   err is an error or null
*   total receives the scalar value on success or null if err
*/
module.exports.executeScalar = function(sql, callback){
    callback = module.exports.once(callback) // a request timeout/error and a stream end can both report; the caller hears once
    if(module.exports.settings.debug)console.log(sql)
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        callback(e, null)
    })
    var done = false;
    parser.on('opentag', function(n){
        if(n.name === 'field'){
            var total = parseInt(n.attributes.value);
            done = true;
            callback && callback(null, total)
            
        }
    })
    parser.on('end', function(){
        if(!done) callback && callback(null, 0)
    })
    request(dpURI(sql)).on('error', function(e){
        if(!done){ done = true; callback && callback(e, null); }
      }).on('response', function(response) {
        if(module.exports.settings.debug)  console.log("Response: "+response.statusCode); // 200
        if(module.exports.settings.debug)  console.log("Data: " + response.data); // data
      }).pipe(parser)
}

module.exports.executeNonQuery = function nonQuery(sql, callback){
    callback = module.exports.once(callback) // a request timeout/error and a stream end can both report; the caller hears once
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    var ok = true;
    parser.on('error', function(e){ callback(e, null)})
    parser.on('end', function(){ callback(null, ok)}) // return true because we did not receive any text which indicates an error
    parser.on('text', function(t){console.log(t); ok = false}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    //console.log(sql)
    request(dpURI(sql)).on('error', function(e){
        callback && callback(e, null)
      }).on('response', function(response) {
        if(module.exports.settings.debug)  console.log("Response: "+response.statusCode); // 200
        if(module.exports.settings.debug)  console.log("Data: " + response.data); // data
      }).pipe(parser)
}

/**********************************************************************************************
*
* Private Functions
*
**********************************************************************************************/

/**
  build 
*/
function buildJoins(from, joinmap)
{
    var joins = "";
    from.forEach(function(el){
        if(el.toLowerCase() === "dp") return;
        if(joinmap.hasOwnProperty(el.toLowerCase())){
            var map = joinmap[el.toLowerCase()]
            joins += map.source + map.dest + " and ";    
        }   
        else{
            throw new Error("Don't know how to join table: " + el)
        }
    })
    joins = joins.substring(0, joins.length - 5)
    return joins;
}

function convertField(field)
{
    switch(field.type)
    {
        case 'datetime':
        case 'shortdatetime':
            return "CONVERT(VARCHAR(10)," + [el.field.source, el.field.name].join(".") + ",101)" 
        default:
            return [el.field.source, el.field.name].join(".")
    }
}
function isQuotable(field)
{
    switch(field.type)
    {
        case 'varchar':
        case 'nvarchar':
        case 'text':
        case 'char':
        case 'nchar':
        case 'ntext':
        case 'datetime':
        case 'time':
        case 'date':
            return true;
        default:
            return false;
    }
}

module.exports.convertValue = function convertValue(value, field){
    switch(field.type){
        case "numeric":
            return parseInt(value)
        case "date":
        case "datetime":
            var m;
            try{
                m = moment(value);
                if(m.isValid()) return m.toDate();
            }
            catch(e){
                m = moment(value, 'MM/DD/YYYY');
                if(m.isValid()) return m.toDate();
                else{
                    return null;
                }
            }
        case "money":
            return parseFloat(value)
        default:
            return value;
    }
}

// ---- DonorPerfect error envelopes -------------------------------------------
// A normal result is <result><record><field .../>...</record>...</result>. When
// the API rejects a request it answers with <field> elements OUTSIDE any
// <record> (e.g. success=false + an error text). The open-tag handlers used to
// dereference "the current record" for those and throw inside the sax stream,
// which is an uncaughtException that takes the whole calling process down.
// Now they park such fields on the context array and the 'end' handler turns
// them into a normal callback error for that one request.
module.exports.noteEnvelopeField = function(context, attributes){
    if(!context || !attributes || !attributes.name) return;
    if(!context.__envelope) Object.defineProperty(context, '__envelope', { value: {}, enumerable: false, writable: true });
    context.__envelope[attributes.name] = attributes.value;
}

module.exports.envelopeError = function(context){
    var env = context && context.__envelope;
    if(!env) return null;
    var ok = String(env.success).toLowerCase();
    var msg = env.error || env.errormessage || env.message || env.reason;
    if((ok === 'true' || ok === '1') && !msg) return null;
    var e = new Error('DonorPerfect error: ' + (msg || JSON.stringify(env)));
    e.envelope = env;
    return e;
}

// the parsers can report through 'text', 'error' and 'end'; make sure a caller
// hears exactly once
module.exports.once = function(callback){
    var called = false;
    return function(){
        if(called) return;
        called = true;
        if(typeof callback === 'function') callback.apply(null, arguments);
    }
}
