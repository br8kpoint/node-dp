var dputils = require('./dp-utils')
    , dpURI = dputils.dpURI
    , check = require('validator').check
    , request = require('request')
    , extend = require('xtend')
/********************************************************************************************************************************
*
* OtherInfo
*
********************************************************************************************************************************/

function OtherInfo(){
    // bootstrap and initialize fields
    for(var i=0; i<OtherInfo.FIELDS.length; i++)
    {
        this[OtherInfo.FIELDS[i].name] = null;
    }
    this.other_id = 0    // new gift
    this.donor_id = null;
    this.other_date = new Date();
    this.comments = "";
    this.use_id = "";
    this.created_by = "";
    this.created_date = new Date();
    
    this.modified_by = null;
    this.modified_date = null;
    this.import_id = null;
    this.wl_import_id = null;
    this.udfFields = {}
}

OtherInfo.FIELDS = [
{"source":"dpotherinfo","name":"other_id","type":"numeric","nullable":false,"max":null,"label":"Gift Id","description":"Gift Id"},
{"source":"dpotherinfo","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
{"source":"dpotherinfo","name":"other_date","type":"datetime","nullable":true,"max":null,"label":"Other Date","description":"Other Date"},
{"source":"dpotherinfo","name":"comments","type":"varchar","nullable":true,"max":4000,"label":"Comments","description":"Comments"},
{"source":"dpotherinfo","name":"created_by","type":"varchar","nullable":true,"max":20,"label":"Created By","description":"Created By"},
{"source":"dpotherinfo","name":"created_date","type":"datetime","nullable":true,"max":null,"label":"Created Date","description":"Created Date"},
{"source":"dpotherinfo","name":"modified_by","type":"varchar","nullable":true,"max":20,"label":"Modified By","description":"Modified By"},
{"source":"dpotherinfo","name":"modified_date","type":"datetime","nullable":true,"max":null,"label":"Modified Date","description":"Modified Date"},
{"source":"dpotherinfo","name":"import_id","type":"numeric","nullable":false,"max":null,"label":"Import Id","description":"Import Id"},
{"source":"dpotherinfo","name":"wl_import_id","type":"numeric","nullable":false,"max":null,"label":"WL Import Id","description":"WL Import Id"}
]

OtherInfo.UDFFIELDS = [
{"source":"dpotherinfoudf","name":"CKECK_DT","type":"datetime","nullable":false,"max":null,"label":"Check Date","description":"Check Date"},
{"source":"dpotherinfoudf","name":"OTHER_GA_NETWORK","type":"varchar","nullable":false,"max":null,"label":"Network","description":"Network"},
{"source":"dpotherinfoudf","name":"OTHER_GA_DEVICE","type":"varchar","nullable":false,"max":null,"label":"Device","description":"Device"},
{"source":"dpotherinfoudf","name":"OTHER_GA_CAMPAIGN_ID","type":"varchar","nullable":false,"max":null,"label":"Campaign ID","description":"Campaign ID"},
{"source":"dpotherinfoudf","name":"OTHER_GA_KEYWORD","type":"varchar","nullable":false,"max":null,"label":"Keyword","description":"Keyword"},
{"source":"dpotherinfoudf","name":"OTHER_GA_DEVICEMODEL","type":"varchar","nullable":false,"max":null,"label":"Device Model","description":"Device Model"},
{"source":"dpotherinfoudf","name":"OTHER_GA_ADGROUP_ID","type":"varchar","nullable":false,"max":null,"label":"Adgroup ID","description":"Adgroup ID"},
{"source":"dpotherinfoudf","name":"OTHER_GCLID","type":"varchar","nullable":false,"max":null,"label":"GCLID","description":"GCLID"},
{"source":"dpotherinfo","name":"OTHER_CREATED_DATE","type":"datetime","nullable":true,"max":null,"label":"Other Created Date","description":"Other Created Date"},
{"source":"dpotherinfo","name":"OTHER_CONVERTED_DATE","type":"datetime","nullable":true,"max":null,"label":"Other Converted Date","description":"Other Converted Date"},
{"source":"dpotherinfoudf","name":"OTHER_GA_PLACEMENT","type":"varchar","nullable":false,"max":null,"label":"Placement","description":"Website where ad was placed"},
]

OtherInfo.JOIN_MAP = {
    "dpotherinfoudf": {
        "source": "dpotherinfo.other_id"
        , "dest": "= dpotherinfoudf.other_id"
    }
    , "dp": {
        "source": "dp.donor_id"
        , "dest": "= dpotherinfo.donor_id"
    }
    , "dpudf":{
        "source": "dpudf.donor_id"
        , "dest": "= dpotherinfo.donor_id"
    }
}

/**
* Saves a gift to donor perfect
*@param callback the callback to fire once finished saving
*@this {Gift}
*/
OtherInfo.prototype.save = function (callback){
    try{
        this.validate();
    }
    catch(ex){
        return callback(new Error(ex), null)
    }
    var params = [ 
        this.other_id 
        ,this.donor_id
        ,this.other_date
        ,this.comments
        ,this.user_id
    ]
    var self = this;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        callback(e, self)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field') {
            self.gift_id = parseInt(n.attributes.value);
        }
    })
    parser.on('end', function(){
        callback && callback(null, self);
    })
    var uri = dpURI('dp_savegift', params)
    request(uri).pipe(parser)
}


/**
* Check to see if the otherinfo has been saved or not
*@returns true if the gift has not been saved, false if the otherinfo is not new
*/
OtherInfo.prototype.isNew = function(){
    return this.other_id !== 0;
}


/**
* Validate the OtherInfo
* @throws an error on failure
*/
OtherInfo.prototype.validate = function(){
    check(this.other_id, 'Gift id must be a number.').isNumeric();
    check(this.donor_id, 'Donor id must be a number.').isNumeric();
    //check(this.record_type, 'Invalid record type.').regex(/[GPS]/);
    
}

/**
 * remove a otherinfo from dp
 * @param {Number} id the id of the otherinfo
 * @param  {Function} cb the callback to execute with the results of the call
 * @return {[type]}      [description]
 */
OtherInfo.remove = function(id, cb){
    var self = this;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        cb(e, self)
    })
    parser.on('end', function(){
        cb && cb(null, self);
    })
    var uri = dpURI("dp_del_xml_gift", [id]);
    console.log(uri);
    request(uri).pipe(parser)
}
/**
* Retrieves a otherinfo
*@param {number|[numbers]|string} ids - number is a single id, numbers is an array of ids, string is an sql query
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
OtherInfo.get = function(ids, callback){
    if(typeof ids === 'number') getByID(ids, callback);
    if(ids instanceof Array) getByArray(ids, callback);
    if(typeof ids === 'string') getBySql(ids, callback);
}

/**
* Retrieves otherinfos by donor id from donor perfect
*@param {number} id - number is a donor id
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
OtherInfo.getByDonorId = function(ids, callback){
    var sql = "select * from dpotherinfo join dpotherinfoudf on dpotherinfo.other_id = dpotherinfoudf.other_id where dpotherinfo.donor_id = " + ids + " order by dpotherinfo.other_date desc";
    getBySql(sql, function(err, gifts){
        if(err){
            callback(err, null);
            return;
        }
        callback(null, gifts)
    });
}


OtherInfo.QUERY_DEFAULTS = {
    criteria: [],               // array of {opperand: "", value: "", field:{source:"", name:""}}
    offset: 0,
    orderBy: "dpotherinfo.other_id",     // fully qualified table.fieldname
    groupBy: null,
    having: null
}
/**
* Retrieves  otherinfos that match the options
* @param {options} an array of criteria objects which has at least {criteria:[{field - see above}, operand, value}]}
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
OtherInfo.query = function(options, callback){
    try
    {
        options = extend(OtherInfo.QUERY_DEFAULTS, options)

        var from = ["dpotherinfo"];
        var where = " where ";
        var orderBy = options.orderBy || "dpotherinfo.other_id"
        if(options.criteria.length == 0) where = "";
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
        where = where.substring(0, where.length - 4)
        if(options.hasOwnProperty("where")){
            if(options.where.toLowerCase().trim().indexOf("and") == 0){
                if(options.criteria.length == 0)
                    where += " where " + options.where.substring(3);
                else
                    where += options.where;
            }
            else if(options.where.toLowerCase().trim().indexOf("or") == 0){
                if(options.criteria.length == 0)
                    where += " where " + options.where.substring(2);
                else
                    where += options.where;
            }
            else{
                if(options.criteria.length == 0)
                    where += " where " + options.where;
                else
                    where += " and " + options.where;
            }
        } 
        if(options.from){
            options.from.forEach(function(el){
                if(from.indexOf(el) === -1) from.push(el);
            })
        }
        where +=  buildJoins(from);
        var sql = "select row_number() over (order by "+ orderBy + ") as rid, dpotherinfo.* from " + from.join(", ") + where;
        if(options.limit){
            sql = "select * from (" + sql + ") as innerselect where rid between " + options.offset + " and " + (options.offset + options.limit - 1)   
        }

        if(dputils.debug)console.log(sql)
        var countsql = "select count(*) from " + from.join(", ") + where;
        if(dputils.debug)console.log(countsql);
        Gift.getCount(countsql, function(err, total){
            if(!err){
                getBySql(sql, function(err, gifts){
                    callback(null, {total: total, results: gifts, limit: options.limit, offset: options.offset})
                })
            }
        })
    }
    catch(err)
    {
        callback(err, null);
    }
    
    

}

OtherInfo.prototype.saveUdf = function(gift_id, callback){
    //only save fields in udf that are defined for the system if a new field is added in dp it MUST be defined in Donor.UDFFIELDS above
    var update = "UPDATE dpotherinfoudf set "
    for(var i = 0; i < OtherInfo.UDFFIELDS.length; i++){
       if(OtherInfo.UDFFIELDS[i].type == "varchar" || OtherInfo.UDFFIELDS[i].type == "datetime"){
            update += OtherInfo.UDFFIELDS[i].name 
            update += this.udfFields[OtherInfo.UDFFIELDS[i].name] ? " = '" + this.udfFields[OtherInfo.UDFFIELDS[i].name] + "'," : " = null,"            
        }
        else update += OtherInfo.UDFFIELDS[i].name + ' = ' + this.udfFields[OtherInfo.UDFFIELDS[i].name] + ","
    }
    //remove comma at end
    update = update.substring(0, update.length - 1)
    update += " where other_id = " + gift_id
    dputils.executeNonQuery(update, callback)
}

function buildJoins(from)
{
    var joins = " and ";
    from.forEach(function(el){
        if(el.toLowerCase() === "dpotherinfo") return;
        if(OtherInfo.JOIN_MAP.hasOwnProperty(el.toLowerCase())){
            var map = Donor.JOIN_MAP[el.toLowerCase()]
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
/**
* Get the count of how many records for a query asynchronously
*/
OtherInfo.getCount = function(sql, callback){
    if(dputils.debug)console.log(sql)
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
OtherInfo.handleSaxError = function(e, context){

}

/**
* Handle the open tag event of the sax parser. If the node is a field it will add the value to the object.
* If it is a result it will create a new gift object and push it to the context array
*@param {sax node} n the node that was parsed by sax
*@param {Array} context the array of gifts
*/
OtherInfo.handleSaxOpenTag = function(n, context){
    if(n.name === 'field'){
        // get last item in context and save value
        var otherinfo = context[context.length - 1]

        if(n.attributes.name in otherinfo){
            var field = OtherInfo.FIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value = dputils.convertValue(n.attributes.value, field[0])
            otherinfo[n.attributes.name] = value;
        } 
        else{
            var field = OtherInfo.UDFFIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value;
            if(field.length > 0) value = dputils.convertValue(n.attributes.value, field[0]);
            else value = n.attributes.value;
            otherinfo.udfFields[n.attributes.name] = value;
        } 
    }
    if(n.name === "record") context.push(new OtherInfo());
         
}

OtherInfo.SaveUdf = function(callback){

}
function getByID(ids, callback){
    var sql = "select * from dpotherinfo join dpotherinfoudf on dpotherinfo.other_id = dpotherinfoudf.other_id where dpotherinfo.other_id = " + ids;
    getBySql(sql, function(err, donors){
        if(err){
            callback(err, null);
            return;
        }
        if(donors.length != 1)
        {
            callback(new Error("Found more than one other for id: " + ids), null)
            return;
        }
        callback(null, donors[0])
    });
}

function getByArray(ids, callback){
    var sql = "select * from dpotherinfo join dpotherinfoudf on dpotherinfo.other_id = dpotherinfoudf.other_id where dpotherinfo.other_id in (" + ids.join() + ")";
    getBySql(sql, callback);
}

function getBySql(ids, callback){
    var sql = ids
    console.log(sql);
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var otherinfos = [];
    parser.on('error', function(e){ OtherInfo.handleSaxError(e, otherinfos)})
    parser.on('opentag', function(n){OtherInfo.handleSaxOpenTag(n, otherinfos)})
    parser.on('end', function(){ callback(null, otherinfos)}) // return the one array of otherinfos
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regular resutls are in nodes!!
    request(dpURI(sql)).pipe(parser)
}

module.exports.OtherInfo = OtherInfo;
