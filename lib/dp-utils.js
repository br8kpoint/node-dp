var dateFormat = require('dateformat'),
    request = require('request'),
    dateutils = require('date-utils')

// set en-us mask

//dateFormat.masks.en_us = "m/d/yyyy h:MM:ss TT";

//changed above on 03/14/2013 because dp can't handle times in date
dateFormat.masks.en_us = "m/d/yyyy";

/********************************************************************************************************************************
*
* Utilities
*
********************************************************************************************************************************/
function dpURI(action, params){
    action = encodeURIComponent(action)
    if(module.exports.debug)console.log(action)
    var uri =  "https://www.donorperfect.net/prod/xmlrequest.asp?action=" + action;
    if(params !== undefined){
      uri += '&params='; 
      var strParams = "" 
      for(var i = 0; i < params.length; i++){
        switch(typeof params[i]){
            case 'string':
                if(params[i] == "null") strParams += params[i] + ",";
                else strParams += "'" + params[i] + "',"
                break;
            case 'number':
                strParams += params[i] + ",";
                break;
            default:
                if(params[i] === null || params[i] === undefined) strParams += "null,"             // param is null
                else if (params[i] instanceof Date) strParams += "'" + dateFormat(params[i], "en_us") + "',";
                else strParams += "'" + params[i].toString() + "',"      // try and use toString

        }
      }
      strParams = strParams.replace(/(^\s*,)|(,\s*$)/g, '');
      uri += strParams
    } 
    uri += "&login=" + module.exports.credentials.username;
    uri += "&pass=" + module.exports.credentials.password;
    if(module.exports.debug) console.log(uri)
    return uri;
}

module.exports.dpURI = dpURI
module.exports.credentials = {"username": "username", "password":"password"};
module.exports.debug = false;
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
    if(module.exports.debug)console.log(sql)
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        callback(e, null)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field'){
            var total = parseInt(n.attributes.value);
            callback && callback(null, total)
        }
    })
    request(dpURI(sql)).pipe(parser)
}

module.exports.executeNonQuery = function nonQuery(sql, callback){
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ callback(e, null)})
    parser.on('end', function(){ callback(null, true)}) // return true because we did not receive any text which indicates an error
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dputil.dpURI(sql)).pipe(parser)
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

module.exports. convertValue = function convertValue(value, field){
    switch(field.type){
        case "numeric":
            return parseInt(value)
        case "date":
        case "datetime":
            return Date.parse(value, "M/d/y")
        case "money":
            return parseFloat(value)
        default:
            return value;
    }
}