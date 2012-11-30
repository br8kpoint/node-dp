var events = require('events'),
    request = require('request'),
    check = require('validator').check,
    extend = require('xtend'),
    dputils = require('./dp-utils'),
    dpURI = dputils.dpURI,
    squel = require("squel")


/********************************************************************************************************************************
*
* Donor
*
********************************************************************************************************************************/

/**
* Represents a donor from donor perfect
*@constructor
*@this {Donor}
*/
function Donor(){
    var self = this;
    // bootstrap and initialize fields
    for(var i=0; i<Donor.FIELDS.length; i++)
    {
        this[Donor.FIELDS[i].name] = null;
    }
    // set sensible defaults for donor
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
    this.user_id = dputils.credentials.username;     // set user to node-dp username
    this.other_state_prov = "";
    this.ccInfo = {};
    this.local_id = 0;
    this.udfFields = {}

}

/*
* Donor fields. An array of objects of the form {}
*/

Donor.FIELDS = [
    {"source":"dp","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
    {"source":"dp","name":"first_name","type":"varchar","nullable":true,"max":50,"label":"First Name","description":"First Name"},
    {"source":"dp","name":"last_name","type":"varchar","nullable":false,"max":75,"label":"Last Name","description":"Last Name"},
    {"source":"dp","name":"middle_name","type":"varchar","nullable":true,"max":50,"label":"Middle Name","description":"Middle Name"},
    {"source":"dp","name":"suffix","type":"varchar","nullable":true,"max":50,"label":"Suffix","description":"Suffix"},
    {"source":"dp","name":"title","type":"varchar","nullable":true,"max":50,"label":"Title","description":"Title"},
    {"source":"dp","name":"salutation","type":"varchar","nullable":true,"max":50,"label":"Salutation","description":"Salutation"},
    {"source":"dp","name":"prof_title","type":"varchar","nullable":true,"max":100,"label":"Prof Title","description":"Prof Title"},
    {"source":"dp","name":"opt_line","type":"varchar","nullable":true,"max":100,"label":"Opt Line","description":"Opt Line"},
    {"source":"dp","name":"address","type":"varchar","nullable":true,"max":100,"label":"Address","description":"Address"},
    {"source":"dp","name":"address2","type":"varchar","nullable":true,"max":100,"label":"Address2","description":"Address2"},
    {"source":"dp","name":"city","type":"varchar","nullable":true,"max":50,"label":"City","description":"City"},
    {"source":"dp","name":"state","type":"varchar","nullable":true,"max":30,"label":"State","description":"State"},
    {"source":"dp","name":"zip","type":"varchar","nullable":true,"max":20,"label":"Zip","description":"Zip"},
    {"source":"dp","name":"country","type":"varchar","nullable":true,"max":30,"label":"Country","description":"Country"},
    {"source":"dp","name":"address_type","type":"varchar","nullable":true,"max":30,"label":"Address Type","description":"Address Type"},
    {"source":"dp","name":"home_phone","type":"varchar","nullable":true,"max":40,"label":"Home Phone","description":"Home Phone"},
    {"source":"dp","name":"business_phone","type":"varchar","nullable":true,"max":40,"label":"Business Phone","description":"Business Phone"},
    {"source":"dp","name":"fax_phone","type":"varchar","nullable":true,"max":40,"label":"Fax Phone","description":"Fax Phone"},
    {"source":"dp","name":"mobile_phone","type":"varchar","nullable":true,"max":40,"label":"Mobile Phone","description":"Mobile Phone"},
    {"source":"dp","name":"email","type":"varchar","nullable":true,"max":75,"label":"Email","description":"Email"},
    {"source":"dp","name":"org_rec","type":"varchar","nullable":true,"max":1,"label":"Org Rec","description":"Org Rec"},
    {"source":"dp","name":"donor_type","type":"varchar","nullable":true,"max":30,"label":"Donor Type","description":"Donor Type"},
    {"source":"dp","name":"nomail","type":"varchar","nullable":false,"max":1,"label":"Nomail","description":"Nomail"},
    {"source":"dp","name":"nomail_reason","type":"varchar","nullable":true,"max":30,"label":"Nomail Reason","description":"Nomail Reason"},
    {"source":"dp","name":"narrative","type":"text","nullable":true,"max":2147483647,"label":"Narrative","description":"Narrative"},
    {"source":"dp","name":"tag_date","type":"datetime","nullable":true,"max":null,"label":"Tag Date","description":"Tag Date"},
    {"source":"dp","name":"initial_gift_date","type":"datetime","nullable":true,"max":null,"label":"Initial Gift Date","description":"Initial Gift Date"},
    {"source":"dp","name":"last_contrib_date","type":"datetime","nullable":true,"max":null,"label":"Last Contrib Date","description":"Last Contrib Date"},
    {"source":"dp","name":"last_contrib_amt","type":"money","nullable":true,"max":null,"label":"Last Contrib Amt","description":"Last Contrib Amt"},
    {"source":"dp","name":"ytd","type":"money","nullable":true,"max":null,"label":"Ytd","description":"Ytd"},
    {"source":"dp","name":"ly_ytd","type":"money","nullable":true,"max":null,"label":"Ly Ytd","description":"Ly Ytd"},
    {"source":"dp","name":"ly2_ytd","type":"money","nullable":true,"max":null,"label":"Ly2 Ytd","description":"Ly2 Ytd"},
    {"source":"dp","name":"ly3_ytd","type":"money","nullable":true,"max":null,"label":"Ly3 Ytd","description":"Ly3 Ytd"},
    {"source":"dp","name":"ly4_ytd","type":"money","nullable":true,"max":null,"label":"Ly4 Ytd","description":"Ly4 Ytd"},
    {"source":"dp","name":"ly5_ytd","type":"money","nullable":true,"max":null,"label":"Ly5 Ytd","description":"Ly5 Ytd"},
    {"source":"dp","name":"ly6_ytd","type":"money","nullable":true,"max":null,"label":"Ly6 Ytd","description":"Ly6 Ytd"},
    {"source":"dp","name":"cytd","type":"money","nullable":true,"max":null,"label":"Cytd","description":"Cytd"},
    {"source":"dp","name":"ly_cytd","type":"money","nullable":true,"max":null,"label":"Ly Cytd","description":"Ly Cytd"},
    {"source":"dp","name":"ly2_cytd","type":"money","nullable":true,"max":null,"label":"Ly2 Cytd","description":"Ly2 Cytd"},
    {"source":"dp","name":"ly3_cytd","type":"money","nullable":true,"max":null,"label":"Ly3 Cytd","description":"Ly3 Cytd"},
    {"source":"dp","name":"ly4_cytd","type":"money","nullable":true,"max":null,"label":"Ly4 Cytd","description":"Ly4 Cytd"},
    {"source":"dp","name":"ly5_cytd","type":"money","nullable":true,"max":null,"label":"Ly5 Cytd","description":"Ly5 Cytd"},
    {"source":"dp","name":"ly6_cytd","type":"money","nullable":true,"max":null,"label":"Ly6 Cytd","description":"Ly6 Cytd"},
    {"source":"dp","name":"autocalc1","type":"money","nullable":true,"max":null,"label":"Autocalc1","description":"Autocalc1"},
    {"source":"dp","name":"autocalc2","type":"money","nullable":true,"max":null,"label":"Autocalc2","description":"Autocalc2"},
    {"source":"dp","name":"autocalc3","type":"money","nullable":true,"max":null,"label":"Autocalc3","description":"Autocalc3"},
    {"source":"dp","name":"gift_total","type":"money","nullable":true,"max":null,"label":"Gift Total","description":"Gift Total"},
    {"source":"dp","name":"gifts","type":"numeric","nullable":true,"max":null,"label":"Gifts","description":"Gifts"},
    {"source":"dp","name":"max_date","type":"datetime","nullable":true,"max":null,"label":"Max Date","description":"Max Date"},
    {"source":"dp","name":"max_amt","type":"money","nullable":true,"max":null,"label":"Max Amt","description":"Max Amt"},
    {"source":"dp","name":"avg_amt","type":"money","nullable":true,"max":null,"label":"Avg Amt","description":"Avg Amt"},
    {"source":"dp","name":"yrs_donated","type":"numeric","nullable":true,"max":null,"label":"Yrs Donated","description":"Yrs Donated"},
    {"source":"dp","name":"created_by","type":"varchar","nullable":true,"max":20,"label":"Created By","description":"Created By"},
    {"source":"dp","name":"created_date","type":"datetime","nullable":true,"max":null,"label":"Created Date","description":"Created Date"},
    {"source":"dp","name":"modified_by","type":"varchar","nullable":true,"max":20,"label":"Modified By","description":"Modified By"},
    {"source":"dp","name":"modified_date","type":"datetime","nullable":true,"max":null,"label":"Modified Date","description":"Modified Date"},
    {"source":"dp","name":"donor_rcpt_type","type":"char","nullable":true,"max":1,"label":"Donor Rcpt Type","description":"Donor Rcpt Type"},
    {"source":"dp","name":"address3","type":"varchar","nullable":true,"max":100,"label":"Address3","description":"Address3"},
    {"source":"dp","name":"address4","type":"varchar","nullable":true,"max":100,"label":"Address4","description":"Address4"},
    {"source":"dp","name":"ukcounty","type":"varchar","nullable":true,"max":100,"label":"Ukcounty","description":"Ukcounty"},
    {"source":"dp","name":"gift_aid_eligible","type":"char","nullable":true,"max":1,"label":"Gift Aid Eligible","description":"Gift Aid Eligible"},
    {"source":"dp","name":"initial_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Initial Temp Record Id","description":"Initial Temp Record Id"},
    {"source":"dp","name":"frequent_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Frequent Temp Record Id","description":"Frequent Temp Record Id"},
    {"source":"dp","name":"recent_temp_record_id","type":"numeric","nullable":true,"max":null,"label":"Recent Temp Record Id","description":"Recent Temp Record Id"},
    {"source":"dp","name":"import_id","type":"numeric","nullable":true,"max":null,"label":"Import Id","description":"Import Id"},
    {"source":"dp","name":"receipt_delivery","type":"varchar","nullable":true,"max":1,"label":"Receipt Delivery","description":"Receipt Delivery"},
    {"source":"dp","name":"no_email","type":"varchar","nullable":true,"max":1,"label":"No Email","description":"No Email"},
    {"source":"dp","name":"no_email_reason","type":"varchar","nullable":true,"max":200,"label":"No Email Reason","description":"No Email Reason"},
    {"source":"dp","name":"email_type","type":"varchar","nullable":true,"max":20,"label":"Email Type","description":"Email Type"},
    {"source":"dp","name":"email_status","type":"varchar","nullable":true,"max":50,"label":"Email Status","description":"Email Status"},
    {"source":"dp","name":"email_status_date","type":"datetime","nullable":true,"max":null,"label":"Email Status Date","description":"Email Status Date"},
    {"source":"dp","name":"opt_out_source","type":"varchar","nullable":true,"max":200,"label":"Opt Out Source","description":"Opt Out Source"},
    {"source":"dp","name":"opt_out_reason","type":"varchar","nullable":true,"max":200,"label":"Opt Out Reason","description":"Opt Out Reason"},
    {"source":"dp","name":"CC_donor_import_time","type":"datetime","nullable":true,"max":null,"label":"CC Donor Import Time","description":"CC Donor Import Time"},
    {"source":"dp","name":"cc_contact_id","type":"bigint","nullable":true,"max":null,"label":"Cc Contact Id","description":"Cc Contact Id"},
]

Donor.QUERY_FIELDS = Donor.FIELDS



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
    var self = this;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        callback(e, self)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field') self.donor_id = parseInt(n.attributes.value);
    })
    parser.on('end', function(){
        callback && callback(null, self);
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


/**
* Validate the Donor
* @throws an error on failure
*/
Donor.prototype.validate = function(){
    check(this.email, 'Please enter a valid email address.').isEmail();
    check(this.first_name, 'Please enter a valid first name.').notNull().len(1, 100);
    check(this.last_name, 'Please enter a valid last name.').notNull().len(1,150);
    check(this.address, 'Please enter a valid address.').notNull().len(1, 100);
    check(this.city, 'Please enter a valid city.').notNull().len(1, 75);
    check(this.state, 'Please enter a valid state or province.').notNull().len(1, 50);
    check(this.country, 'Please select a valid country.').notNull().len(1, 50);

}

Donor.prototype.destroy = function(callback){
    var params = [this.donor_id];
    request(dpURI("dp_del_xml_donor", params), function(error, response, body){
        if (!error && response.statusCode == 200) {
            callback && callback(body);      // if they don't care we don't
        }
    })
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


Donor.QUERY_DEFAULTS = {
    criteria: [],               // array of {opperand: "", value: "", field:{source:"", name:""}}
    offset: 0,
    orderBy: "dp.donor_id",     // fully qualified table.fieldname
    groupBy: null,
    having: null
}
/**
* Retrieves a donors that match the options
* @param {options} an array of criteria objects which has at least {criteria:[{field - see above}, operand, value}]}
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Donor.query = function(options, callback){
    try
    {
        options = extend(Donor.QUERY_DEFAULTS, options)

        var from = ["dp"];
        var where = " where ";
        var orderBy = options.orderBy || "dp.donor_id"
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
        var sql = "select row_number() over (order by "+ orderBy + ") as rid, dp.* from " + from.join(", ") + where;
        if(options.limit){
            sql = "select * from (" + sql + ") as innerselect where rid between " + options.offset + " and " + (options.offset + options.limit - 1)   
        }

        console.log(sql)
        var countsql = "select count(*) from " + from.join(", ") + where;
        console.log(countsql);
        Donor.getCount(countsql, function(err, total){
            if(!err){
                getBySql(sql, function(err, donors){
                    callback(null, {total: total, results: donors, limit: options.limit, offset: options.offset})
                })
            }
        })
    }
    catch(err)
    {
        callback(err, null);
    }
    
    

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
* Tet the count of how many records for a query asynchronously
*/
Donor.getCount = function(sql, callback){
    console.log(sql)
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
    if(n.name === "record") context.push(new Donor());
         
}


function getByID(ids, callback){
    var sql = "select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id = " + ids;
    getBySql(sql, function(err, donors){
        if(err){
            callback(err, null);
            return;
        }
        if(donors.length != 1)
        {
            callback(new Error("Found more than one donor for id: " + ids), null)
            return;
        }
        callback(null, donors[0])
    });
}

function getByArray(ids, callback){
    var sql = "select * from dp join dpudf on dp.donor_id = dpudf.donor_id where dp.donor_id in (" + ids.join() + ")";
    getBySql(sql, callback);
}

function getBySql(ids, callback){
    var sql = ids
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var donors = [];
    parser.on('error', function(e){ Donor.handleSaxError(e, donors)})
    parser.on('opentag', function(n){Donor.handleSaxOpenTag(n, donors)})
    parser.on('end', function(){ callback(null, donors)}) // return the one and only donor specified by the id
    //parser.on('text', function(t){callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dpURI(sql)).pipe(parser)
}

module.exports.Donor = Donor