var events = require('events'),
    request = require('request'),
    check = require('validator').check,
    extend = require('xtend'),
    dputils = require('./dp-utils'),
    dpURI = dputils.dpURI,
    gifts = require('./gift'),
    Flag = require('./flag').Flag,
    contacts = require('./contact')
    async = require('async')

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
function Donor(data){
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
    this.flags = [];            // array of flag objects.
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

Donor.UDFFIELDS = [
    {"source":"dpudf","name":"WEBSITE_PASSWORD","type":"varchar","nullable":true,"max":null,"label":"Website Password","description":"Password used to log in to the donation page."},
    {"source":"dpudf","name":"ASSIGNED_THANKYOUS","type":"varchar","nullable":true,"max":null,"label":"Assigned Thank You Solicitiations","description":"Comma separated list of assigned thank you solicitiations"},
    {"source":"dpudf","name":"LAST_CONTACT_DATE","type":"datetime","nullable":true,"max":null,"label":"Last DP Contact Date","description":"Last DP Contact Date"},
    {"source":"dpudf","name":"FUNDRAISERS","type":"varchar","nullable":true,"max":200,"label":"Ministry Callers","description":"Ministry Callers"},
    {"source":"dpudf","name":"PAYPAL_EMAIL","type":"varchar","nullable":true,"max":200,"label":"Paypal Email","description":"Paypal Email"},
    {"source":"dpudf","name":"EFT_ROUTING_NUMBER","type":"varchar","nullable":false,"max":200,"label":"Eft Routing Number","description":"Eft Routing Number"},
    {"source":"dpudf","name":"EFT_ACCOUNT_NUMBER","type":"varchar","nullable":true,"max":200,"label":"Eft Account Number","description":"Eft Account Number"},
    {"source":"dpudf","name":"PAYMENT_SYSTEM","type":"varchar","nullable":true,"max":200,"label":"Payment System","description":"Payment System"},
    {"source":"dpudf","name":"PICTURE_URL","type":"varchar","nullable":true,"max":200,"label":"Picture Url","description":"Picture Url"},
    {"source":"dpudf","name":"CHASE_PROFILE_ID","type":"varchar","nullable":true,"max":200,"label":"Chase Profile Id","description":"Chase Profile Id"},
    {"source":"dpudf","name":"EMAIL_CONFIRMED_DATE","type":"datetime","nullable":true,"max":200,"label":"Email Confirmed Date","description":"Email Confirmed Date"},
    {"source":"dpudf","name":"CHAPTER_CHOICE","type":"varchar","nullable":true,"max":200,"label":"Chapter Name","description":"Chapter Name"},
    {"source":"dpudf","name":"EVANGLIST_NAME","type":"varchar","nullable":true,"max":200,"label":"Evangelist Name","description":"Evangelist Name"},
    {"source":"dpudf","name":"CHAPTERSCHOSEN","type":"varchar","nullable":true,"max":200,"label":"Chapters Paid","description":"Chapters Paid"},
    {"source":"dpudf","name":"IN_HONOR_OF","type":"varchar","nullable":true,"max":200,"label":"In Honor Of","description":"In Honor Of"},
    {"source":"dpudf","name":"SPECIAL_NOTE","type":"varchar","nullable":true,"max":200,"label":"Special Note","description":"Special Note"},
    {"source":"dpudf","name":"CCTYPE","type":"varchar","nullable":true,"max":200,"label":"Credit Card Type","description":"Credit Card Type"},
    {"source":"dpudf","name":"SEC_CODE","type":"varchar","nullable":true,"max":200,"label":"Security Code","description":"Security Code"},
    {"source":"dpudf","name":"CCNUM","type":"varchar","nullable":true,"max":200,"label":"Credit Card Number","description":"Credit Card Number"},
    {"source":"dpudf","name":"CCEXP","type":"varchar","nullable":true,"max":200,"label":"Credit Card Exp. Date","description":"Credit Card Exp. Date"},
    {"source":"dpudf","name":"TZ_OFFSET","type":"varchar","nullable":true,"max":200,"label":"Time Zone Offset","description":"Time Zone Offset in minutes from UTC/GMT"},
    {"source":"dpudf","name":"TIME_ZONE","type":"varchar","nullable":true,"max":200,"label":"Time Zone Name","description":"Time Zone Name"},
    {"source":"dpudf","name":"TIME_ZONE_ID","type":"varchar","nullable":true,"max":200,"label":"Time Zone ID","description":"Olsen Time Zone ID"},
    {"source":"dpudf","name":"LAT","type":"varchar","nullable":true,"max":null,"label":"Latitude","description":"Latitude Coordinate"},
    {"source":"dpudf","name":"LNG","type":"varchar","nullable":true,"max":null,"label":"Longitude","description":"Longitude Coordinate"},
    {"source":"dpudf","name":"Gender","type":"varchar","nullable":true,"max":200,"label":"Gender","description":"Gender"},
    ]
Donor.JOIN_MAP = {
    "dpudf": {
        "source": "dp.donor_id"
        , "dest": "= dpudf.donor_id"
    }
    , "dpgift": {
        "source": "dp.donor_id"
        , "dest": "= dpgift.donor_id"
    }
}

Donor.QUERY_FIELDS = Donor.FIELDS.concat(Donor.UDFFIELDS)


Donor.prototype.saveUdf = function(donor_id, callback){
    //only save fields in udf that are defined for the system if a new field is added in dp it MUST be defined in Donor.UDFFIELDS above
    var update = "UPDATE dpudf set "
    for(var i = 0; i < Donor.UDFFIELDS.length; i++){
       if(Donor.UDFFIELDS[i].type == "varchar" || Donor.UDFFIELDS[i].type == "datetime"){
            update += Donor.UDFFIELDS[i].name 
            update += this.udfFields[Donor.UDFFIELDS[i].name] ? " = '" + this.udfFields[Donor.UDFFIELDS[i].name] + "'," : " = null,"            
        }
        else update += Donor.UDFFIELDS[i].name + ' = ' + this.udfFields[Donor.UDFFIELDS[i].name] + ","
    }
    //remove comma at end
    update = update.substring(0, update.length - 1)
    update += " where donor_id = " + donor_id
    dputils.executeNonQuery(update, callback)
}
/**
* Saves a donor to donor perfect
*@param callback the callback to fire once finished saving
*@this {Donor}
*/
Donor.prototype.save = function (callback){
    try{
        //this.validate();
    }
    catch(ex){
        return(callback(new Error("validation error"), ex))
    }
    var donor_id = this.donor_id
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
        self.saveUdf(donor_id, function(err, result){
            callback && callback(err, self);
        })
    })
    request(dpURI('dp_savedonor', params)).pipe(parser)
}

/**
* Check to see if the donor has been saved or not
*@returns true if the donor has not been saved, false if the donor is not new
*/
Donor.prototype.isNew = function(){
    return this.donor_id === 0;
}


/**
* Validate the Donor
* @throws an error on failure
*/
Donor.prototype.validate = function(){
    //check(this.email, 'Please enter a valid email address.').isEmail();
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

Donor.prototype.getGifts = function(callback){
    gifts.getByDonorId(this.donor_id, function(err, gifts){
        if(this.hasOwnProperty("gifts")){
            //already feteched gifts
            callback(null, this.gifts)
        }
        if(!err)
        {
            // cache gifts for object life
            this.gifts = gifts;
        }
    })
}
/**
 * Retrieves all flags for a donor
 * @param  {Function} callback callback which receives (err, flags)
 * 
 */
Donor.prototype.getFlags = function(callback){
    self = this;
    Flag.getByDonorId(this.donor_id, function(err, f){
        if(!err)
        {
            // cache gifts for object life
            self.flags = f;
            callback(err, f)
        }
        else callback(err, f)
    })
}

/**
 * Adds a flag to the donor
 * @param  {string}   code     The dp code of the associated flag
 * @param  {Function} callback The callback which receives (err, new flag)
 * @return {[type]}            [description]
 */
Donor.prototype.addFlag = function(code, callback){
    flag = new Flag()
    flag.donor_id = this.donor_id
    flag.flag = code;
    self = this;
    Flag.add(flag, function(err, f){
        debugger;
        self.flags.push(f)
        return callback(err, f)
    })
}

/**
 * Adds multiple flag objects to this donor. It will ensure donor_id = this.donor_id
 * @param  {[type]}   flags    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Donor.prototype.addFlags = function(flags, callback){
    flags.forEach(function(f){
        f.donor_id = this.donor_id;
    })
    self=this;
    Flag.add(flags, function(err, f){
        self.flags.concat(f)
        return callback(err, f)
    })
}
/**
* Retrieves a donor or donors from donor perfect
*@param {number|[numbers]|string} ids - number is a single id, numbers is an array of ids, string is an sql query
*@param {callback} callback = called to pass back results 
*@static
*/
Donor.get = function(ids, callback){
    function retrieveFlags(err, donors){
        if(err) return callback(err, donors)
        if(Array.isArray(donors)){
            // get flags for each donor
            async.each(donors, function(donor, cb){
                donor.getFlags(function(err, f){
                    if(err){
                        if(donor.errors) donor.errors.push(err);
                        else{
                            donor.errors = [];
                            donor.errors.push(err);
                        }
                        cb(null)    // don't return the error to keep going with next donor.
                    }
                }, function(err){
                    return callback(err, donors)
                })
            })
        } else{
            donors.getFlags(function(err, f){
                if(err){
                    if(donors.errors) donors.errors.push(err);
                    else{
                        donors.errors = [];
                        donors.errors.push(err);
                    }
                }
                
                return callback(null, donors)
            })
        }
    }
    if(typeof ids === 'number') getByID(ids, callback);
    if(ids instanceof Array) getByArray(ids, callback);
    if(typeof ids === 'string') getBySql(ids, callback);
}


Donor.QUERY_DEFAULTS = {
    criteria: [],               // array of {opperand: "", value: "", field:{source:"", name:""}}
    offset: 0,
    orderBy: "dp.donor_id",     // fully qualified table.fieldname
    groupBy: null,
    having: null,
    from: []
}
/**
* Retrieves a donors that match the options
* @param {options} an array of criteria objects which has at least {criteria:[{field - see above}, operand, value}]}
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Donor.query = function(options, callback){
    options = extend({}, Donor.QUERY_DEFAULTS, options)
    if(options.sql != ""){
        getBySql(options.sql, function(err, donors){
            if(err) callback(err, null)
            callback(null, {total: donors.length, results: donors, limit: options.limit, offset: options.offset, query: options})
        })
        return;
    }
    if(dputils.debug)console.log(options)
    //add dp if not in from
    if(options.from.indexOf("dp") === -1) options.from = options.from.concat(["dp"]);
    //add dp udf to results
    if(options.from.indexOf("dpudf") === -1)options.from.push("dpudf")
    var from = dputils.buildSql(options, Donor.JOIN_MAP)
    var sql = "select row_number() over (order by "+ options.orderBy + ") as rid, "+ buildSelect() + " from " + from;
    if(options.limit){
        sql = "select * from (" + sql + ") as innerselect where rid between " + options.offset + " and " + (options.offset + options.limit - 1)   
    }
    if(dputils.debug)console.log(sql)
    var countsql = "select count(*) from " + from;
    if(dputils.debug)console.log(countsql);
    dputils.executeScalar(countsql, function(err, total){
        if(!err){
            getBySql(sql, function(err, donors){
                if(err) callback(err, null)
                callback(null, {total: total, results: donors, limit: options.limit, offset: options.offset, query: options})
            })
        } else{
            callback(err, null)
        }
    })
}

function buildSelect(){
    var dpfields = ["dp.*"]
    var dpudffields = Donor.UDFFIELDS.map(function(item){
        return item.source + '.' + item.name;
    })
    return dpfields.concat(dpudffields).join(", ")
}
Donor.buildSql = function(options){
    return dputils.buildSql(options, Donor.JOIN_MAP)
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

        if(n.attributes.name in donor){
            var field = Donor.FIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value = dputils.convertValue(n.attributes.value, field[0])
            donor[n.attributes.name] = value;
        } 
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
    parser.on('end', function(){ 
        if(dputils.debug)console.log("returning donors: ", donors)
        callback(null, donors)
    }) 
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dpURI(sql)).pipe(parser)
}

module.exports.Donor = Donor
