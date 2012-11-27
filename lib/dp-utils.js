var dateFormat = require('dateformat')

// set en-us mask

dateFormat.masks.en_us = "m/d/yyyy h:MM:ss TT";

/********************************************************************************************************************************
*
* Utilities
*
********************************************************************************************************************************/
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
                else if (params[i] instanceof Date) strParams += "'" + dateFormat(params[i], "en_us") + "',";
                else strParams += "'" + params[i].toString() + "',"      // try and use toString

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

module.exports.dpURI = dpURI
module.exports.credentials = {"username": "username", "password":"password"};