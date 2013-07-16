var dputils = require('./dp-utils')
    , dpURI = dputils.dpURI
    , check = require('validator').check
    , request = require('request')
    , extend = require('xtend')
/********************************************************************************************************************************
*
* Gifts
*
********************************************************************************************************************************/

function Gift(){
    // bootstrap and initialize fields
    for(var i=0; i<Gift.FIELDS.length; i++)
    {
        this[Gift.FIELDS[i].name] = null;
    }
    this.gift_id = 0    // new gift
    this.donor_id = null;
    this.record_type = "G"; //(‘G’ for Gift, ‘P’ for Pledge)
    this.gift_date = new Date();
    this.amount = undefined;
    this.gl_code = null;
    this.solicit_code = null;
    this.sub_solicit_code = null;
    this.gift_type = null;
    this.split_gift = "N";
    this.pledge_payment = "N";
    this.reference = null;
    this.memory_honor = null;
    this.gfname = null;
    this.glname = null;
    this.fmv = null;
    this.batch_no = 0;
    this.gift_narrative = null;
    this.ty_letter_no = null;
    this.glink = null;
    this.plink = null;
    this.nocalc = "N";
    this.receipt = "Y";
    this.old_amount = null;
    this.user_id = dputils.credentials.username;
    this.campaign = null;
    this.membership_type = null;
    this.membership_level  = null;
    this.membership_enr_date = null;
    this.membership_exp_date = null;
    this.membership_link_ID = null;
    this.address_id = null;
    this.balance = "";
    this.udfFields = {}
}

Gift.FIELDS = [
{"source":"dpgift","name":"gift_id","type":"numeric","nullable":false,"max":null,"label":"Gift Id","description":"Gift Id"},
{"source":"dpgift","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
{"source":"dpgift","name":"record_type","type":"varchar","nullable":false,"max":1,"label":"Record Type","description":"Record Type"},
{"source":"dpgift","name":"gift_date","type":"datetime","nullable":true,"max":null,"label":"Gift Date","description":"Gift Date"},
{"source":"dpgift","name":"amount","type":"money","nullable":true,"max":null,"label":"Amount","description":"Amount"},
{"source":"dpgift","name":"gl_code","type":"varchar","nullable":true,"max":30,"label":"Gl Code","description":"Gl Code"},
{"source":"dpgift","name":"solicit_code","type":"varchar","nullable":true,"max":30,"label":"Solicit Code","description":"Solicit Code"},
{"source":"dpgift","name":"sub_solicit_code","type":"varchar","nullable":true,"max":30,"label":"Sub Solicit Code","description":"Sub Solicit Code"},
{"source":"dpgift","name":"campaign","type":"varchar","nullable":true,"max":30,"label":"Campaign","description":"Campaign"},
{"source":"dpgift","name":"gift_type","type":"varchar","nullable":true,"max":30,"label":"Gift Type","description":"Gift Type"},
{"source":"dpgift","name":"split_gift","type":"varchar","nullable":false,"max":1,"label":"Split Gift","description":"Split Gift"},
{"source":"dpgift","name":"pledge_payment","type":"varchar","nullable":false,"max":1,"label":"Pledge Payment","description":"Pledge Payment"},
{"source":"dpgift","name":"first_gift","type":"varchar","nullable":true,"max":1,"label":"First Gift","description":"First Gift"},
{"source":"dpgift","name":"reference","type":"varchar","nullable":true,"max":100,"label":"Reference","description":"Reference"},
{"source":"dpgift","name":"memory_honor","type":"varchar","nullable":true,"max":30,"label":"Memory Honor","description":"Memory Honor"},
{"source":"dpgift","name":"gfname","type":"varchar","nullable":true,"max":50,"label":"Gfname","description":"Gfname"},
{"source":"dpgift","name":"glname","type":"varchar","nullable":true,"max":75,"label":"Glname","description":"Glname"},
{"source":"dpgift","name":"fmv","type":"money","nullable":true,"max":null,"label":"Fmv","description":"Fmv"},
{"source":"dpgift","name":"batch_no","type":"numeric","nullable":false,"max":null,"label":"Batch No","description":"Batch No"},
{"source":"dpgift","name":"gift_narrative","type":"varchar","nullable":true,"max":3000,"label":"Gift Narrative","description":"Gift Narrative"},
{"source":"dpgift","name":"ty_letter_no","type":"varchar","nullable":true,"max":30,"label":"Ty Letter No","description":"Ty Letter No"},
{"source":"dpgift","name":"glink","type":"numeric","nullable":true,"max":null,"label":"Glink","description":"Glink"},
{"source":"dpgift","name":"plink","type":"numeric","nullable":true,"max":null,"label":"Plink","description":"Plink"},
{"source":"dpgift","name":"nocalc","type":"varchar","nullable":false,"max":1,"label":"Nocalc","description":"Nocalc"},
{"source":"dpgift","name":"receipt","type":"varchar","nullable":false,"max":1,"label":"Receipt","description":"Receipt"},
{"source":"dpgift","name":"ty_date","type":"datetime","nullable":true,"max":null,"label":"Ty Date","description":"Ty Date"},
{"source":"dpgift","name":"start_date","type":"datetime","nullable":true,"max":null,"label":"Start Date","description":"Start Date"},
{"source":"dpgift","name":"total","type":"money","nullable":true,"max":null,"label":"Total","description":"Total"},
{"source":"dpgift","name":"bill","type":"money","nullable":true,"max":null,"label":"Bill","description":"Bill"},
{"source":"dpgift","name":"balance","type":"money","nullable":true,"max":null,"label":"Balance","description":"Balance"},
{"source":"dpgift","name":"delinquent","type":"money","nullable":true,"max":null,"label":"Delinquent","description":"Delinquent"},
{"source":"dpgift","name":"initial_payment","type":"varchar","nullable":false,"max":1,"label":"Initial Payment","description":"Initial Payment"},
{"source":"dpgift","name":"frequency","type":"varchar","nullable":true,"max":30,"label":"Frequency","description":"Frequency"},
{"source":"dpgift","name":"reminder","type":"varchar","nullable":false,"max":1,"label":"Reminder","description":"Reminder"},
{"source":"dpgift","name":"last_bill_date","type":"datetime","nullable":true,"max":null,"label":"Last Bill Date","description":"Last Bill Date"},
{"source":"dpgift","name":"last_paid_date","type":"datetime","nullable":true,"max":null,"label":"Last Paid Date","description":"Last Paid Date"},
{"source":"dpgift","name":"writeoff_date","type":"datetime","nullable":true,"max":null,"label":"Writeoff Date","description":"Writeoff Date"},
{"source":"dpgift","name":"writeoff_amount","type":"money","nullable":true,"max":null,"label":"Writeoff Amount","description":"Writeoff Amount"},
{"source":"dpgift","name":"created_by","type":"varchar","nullable":true,"max":20,"label":"Created By","description":"Created By"},
{"source":"dpgift","name":"created_date","type":"datetime","nullable":true,"max":null,"label":"Created Date","description":"Created Date"},
{"source":"dpgift","name":"modified_by","type":"varchar","nullable":true,"max":20,"label":"Modified By","description":"Modified By"},
{"source":"dpgift","name":"modified_date","type":"datetime","nullable":true,"max":null,"label":"Modified Date","description":"Modified Date"},
{"source":"dpgift","name":"membership_type","type":"varchar","nullable":true,"max":30,"label":"Membership Type","description":"Membership Type"},
{"source":"dpgift","name":"membership_level","type":"varchar","nullable":true,"max":30,"label":"Membership Level","description":"Membership Level"},
{"source":"dpgift","name":"membership_enr_date","type":"datetime","nullable":true,"max":null,"label":"Membership Enr Date","description":"Membership Enr Date"},
{"source":"dpgift","name":"membership_exp_date","type":"datetime","nullable":true,"max":null,"label":"Membership Exp Date","description":"Membership Exp Date"},
{"source":"dpgift","name":"address_id","type":"numeric","nullable":true,"max":null,"label":"Address Id","description":"Address Id"},
{"source":"dpgift","name":"alink","type":"numeric","nullable":true,"max":null,"label":"Alink","description":"Alink"},
{"source":"dpgift","name":"batch_gift_id","type":"numeric","nullable":true,"max":null,"label":"Batch Gift Id","description":"Batch Gift Id"},
{"source":"dpgift","name":"tlink","type":"numeric","nullable":true,"max":null,"label":"Tlink","description":"Tlink"},
{"source":"dpgift","name":"RCPT_type","type":"varchar","nullable":true,"max":1,"label":"RCPT type","description":"RCPT type"},
{"source":"dpgift","name":"RCPT_STATUS","type":"varchar","nullable":true,"max":200,"label":"RCPT STATUS","description":"RCPT STATUS"},
{"source":"dpgift","name":"RCPT_DATE","type":"datetime","nullable":true,"max":null,"label":"RCPT DATE","description":"RCPT DATE"},
{"source":"dpgift","name":"RCPT_NUM","type":"varchar","nullable":true,"max":200,"label":"RCPT NUM","description":"RCPT NUM"},
{"source":"dpgift","name":"TRIBUTE_START_DATE","type":"datetime","nullable":true,"max":null,"label":"TRIBUTE START DATE","description":"TRIBUTE START DATE"},
{"source":"dpgift","name":"TRIBUTE_end_DATE","type":"datetime","nullable":true,"max":null,"label":"TRIBUTE End DATE","description":"TRIBUTE End DATE"},
{"source":"dpgift","name":"TRIBUTE_MAIN_CONTACT","type":"numeric","nullable":true,"max":null,"label":"TRIBUTE MAIN CONTACT","description":"TRIBUTE MAIN CONTACT"},
{"source":"dpgift","name":"tribute_description","type":"varchar","nullable":true,"max":200,"label":"Tribute Description","description":"Tribute Description"},
{"source":"dpgift","name":"line_id","type":"numeric","nullable":true,"max":null,"label":"Line Id","description":"Line Id"},
{"source":"dpgift","name":"gift_aid_date","type":"datetime","nullable":true,"max":null,"label":"Gift Aid Date","description":"Gift Aid Date"},
{"source":"dpgift","name":"batch_id_temp","type":"numeric","nullable":true,"max":null,"label":"Batch Id Temp","description":"Batch Id Temp"},
{"source":"dpgift","name":"gift_aid_amt","type":"money","nullable":true,"max":null,"label":"Gift Aid Amt","description":"Gift Aid Amt"},
{"source":"dpgift","name":"gift_aid_eligible_g","type":"char","nullable":true,"max":1,"label":"Gift Aid Eligible G","description":"Gift Aid Eligible G"},
{"source":"dpgift","name":"currency","type":"varchar","nullable":true,"max":3,"label":"Currency","description":"Currency"},
{"source":"dpgift","name":"vault_id","type":"numeric","nullable":true,"max":null,"label":"Vault Id","description":"Vault Id"},
{"source":"dpgift","name":"GA_origid","type":"numeric","nullable":true,"max":null,"label":"GA Origid","description":"GA Origid"},
{"source":"dpgift","name":"GA_timestmp","type":"varchar","nullable":true,"max":30,"label":"GA Timestmp","description":"GA Timestmp"},
{"source":"dpgift","name":"GA_Runby","type":"varchar","nullable":true,"max":20,"label":"GA Runby","description":"GA Runby"},
{"source":"dpgift","name":"eft_status_description","type":"varchar","nullable":true,"max":255,"label":"Eft Status Description","description":"Eft Status Description"},
{"source":"dpgift","name":"import_id","type":"numeric","nullable":true,"max":null,"label":"Import Id","description":"Import Id"},
{"source":"dpgift","name":"eftbatch","type":"numeric","nullable":true,"max":null,"label":"Eftbatch","description":"Eftbatch"},
{"source":"dpgift","name":"receipt_delivery_g","type":"varchar","nullable":true,"max":1,"label":"Receipt Delivery G","description":"Receipt Delivery G"},
{"source":"dpgift","name":"contact_id","type":"numeric","nullable":true,"max":null,"label":"Contact Id","description":"Contact Id"},
{"source":"dpgift","name":"EmailSentTY_Date","type":"datetime","nullable":true,"max":null,"label":"EmailSentTY Date","description":"EmailSentTY Date"},
{"source":"dpgift","name":"LetterSentTY_Date","type":"datetime","nullable":true,"max":null,"label":"LetterSentTY Date","description":"LetterSentTY Date"},
{"source":"dpgift","name":"auction_category","type":"varchar","nullable":true,"max":100,"label":"Auction Category","description":"Auction Category"},
{"source":"dpgift","name":"auction_sold","type":"varchar","nullable":true,"max":20,"label":"Auction Sold","description":"Auction Sold"},
{"source":"dpgift","name":"starting_bid","type":"money","nullable":true,"max":null,"label":"Starting Bid","description":"Starting Bid"},
{"source":"dpgift","name":"auction_item_no","type":"numeric","nullable":true,"max":null,"label":"Auction Item No","description":"Auction Item No"},
{"source":"dpgift","name":"bundle_id","type":"numeric","nullable":true,"max":null,"label":"Bundle Id","description":"Bundle Id"},
{"source":"dpgift","name":"event_id","type":"numeric","nullable":true,"max":null,"label":"Event Id","description":"Event Id"},
{"source":"dpgift","name":"ACKNOWLEDGEPREF","type":"varchar","nullable":true,"max":3,"label":"ACKNOWLEDGEPREF","description":"ACKNOWLEDGEPREF"},
]

Gift.UDFFIELDS = [
{"source":"dpgift","name":"CKECK_DT","type":"datetime","nullable":false,"max":null,"label":"Check Date","description":"Check Date"},
{"source":"dpgift","name":"GIFT_ALLOCATION","type":"varchar","nullable":false,"max":null,"label":"Gift Allocation","description":"Gift Allocation"},
{"source":"dpgift","name":"BATCH_SOURCE","type":"varchar","nullable":false,"max":null,"label":"Batch Source","description":"Batch Source"},
{"source":"dpgift","name":"GIFT_AMOUNT","type":"varchar","nullable":false,"max":null,"label":"Gift Amount","description":"Gift Amount"},
{"source":"dpgift","name":"ORDER_NUM","type":"varchar","nullable":false,"max":null,"label":"Order Number","description":"N Number"},
{"source":"dpgift","name":"TITHE_FREQUENCY","type":"varchar","nullable":false,"max":null,"label":"Tithe Frequency","description":"Tithe Frequency"},
{"source":"dpgift","name":"CALLCENTER_PROCESSED","type":"varchar","nullable":false,"max":null,"label":"Tithe Frequency","description":"Tithe Frequency"},
{"source":"dpgift","name":"CALLER","type":"varchar","nullable":false,"max":null,"label":"Ministry Caller","description":"Ministry Caller"},
]

Gift.JOIN_MAP = {
    "dpgiftudf": {
        "source": "dpgift.gift_id"
        , "dest": "= dpgiftudf.gift_id"
    }
    , "dp": {
        "source": "dp.donor_id"
        , "dest": "= dpgift.donor_id"
    }
    , "dpudf":{
        "source": "dpudf.donor_id"
        , "dest": "= dpgift.donor_id"
    }
}

/**
* Saves a gift to donor perfect
*@param callback the callback to fire once finished saving
*@this {Gift}
*/
Gift.prototype.save = function (callback){
    try{
        this.validate();
    }
    catch(ex){
        return callback(new Error(ex), null)
    }
    var params = [ 
        this.gift_id 
        ,this.donor_id
        ,this.record_type
        ,this.gift_date
        ,this.amount
        ,this.gl_code
        ,this.solicit_code
        ,this.sub_solicit_code
        ,this.gift_type
        ,this.split_gift
        ,this.pledge_payment
        ,this.reference
        ,this.memory_honor
        ,this.gfname
        ,this.glname
        ,this.fmv
        ,this.batch_no
        ,this.gift_narrative
        ,this.ty_letter_no
        ,this.glink
        ,this.plink
        ,this.nocalc
        ,this.receipt
        ,this.old_amount
        ,this.user_id
        ,this.campaign
        ,this.membership_type
        ,this.membership_level
        ,this.membership_enr_date
        ,this.membership_exp_date
        ,this.membership_link_ID
        ,this.address_id
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
* Check to see if the gift has been saved or not
*@returns true if the gift has not been saved, false if the gift is not new
*/
Gift.prototype.isNew = function(){
    return this.gift_id !== 0;
}


/**
* Validate the Donor
* @throws an error on failure
*/
Gift.prototype.validate = function(){
    check(this.gift_id, 'Gift id must be a number.').isNumeric();
    check(this.donor_id, 'Donor id must be a number.').isNumeric();
    //check(this.record_type, 'Invalid record type.').regex(/[GPS]/);
    check(this.amount, 'Amount must be decimal').isDecimal();
    check(this.split_gift, 'Invalid split gift: must be Y or N').regex(/[YN]/);
    check(this.pledge_payment, 'Invalid pledge payment: must be Y or N').regex(/[YN]/);
    if(this.fmv !== null || this.fmv !== "null") check(this.fmv, 'fmv must be decimal').isDecimal();
    check(this.batch_no, 'batch_no must be null or a number').isNumeric();

}

/**
* Retrieves a gift or gifts from donor perfect
*@param {number|[numbers]|string} ids - number is a single id, numbers is an array of ids, string is an sql query
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Gift.get = function(ids, callback){
    if(typeof ids === 'number') getByID(ids, callback);
    if(ids instanceof Array) getByArray(ids, callback);
    if(typeof ids === 'string') getBySql(ids, callback);
}

/**
* Retrieves gifts by donor id from donor perfect
*@param {number} id - number is a donor id
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Gift.getByDonorId = function(ids, callback){
    var sql = "select * from dpgift join dpgiftudf on dpgift.gift_id = dpgiftudf.gift_id where dpgift.donor_id = " + ids + " order by dpgift.gift_date desc";
    getBySql(sql, function(err, gifts){
        if(err){
            callback(err, null);
            return;
        }
        callback(null, gifts)
    });
}


Gift.QUERY_DEFAULTS = {
    criteria: [],               // array of {opperand: "", value: "", field:{source:"", name:""}}
    offset: 0,
    orderBy: "dpgift.gift_id",     // fully qualified table.fieldname
    groupBy: null,
    having: null
}
/**
* Retrieves  gifts that match the options
* @param {options} an array of criteria objects which has at least {criteria:[{field - see above}, operand, value}]}
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Gift.query = function(options, callback){
    try
    {
        options = extend(Gift.QUERY_DEFAULTS, options)

        var from = ["dpgift"];
        var where = " where ";
        var orderBy = options.orderBy || "dpgift.gift_id"
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
        var sql = "select row_number() over (order by "+ orderBy + ") as rid, dpgift.* from " + from.join(", ") + where;
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

Gift.prototype.saveUdf = function(gift_id, callback){
    //only save fields in udf that are defined for the system if a new field is added in dp it MUST be defined in Donor.UDFFIELDS above
    var update = "UPDATE dpudf set "
    for(var i = 0; i < Gift.UDFFIELDS.length; i++){
       if(Gift.UDFFIELDS[i].type == "varchar" || Gift.UDFFIELDS[i].type == "datetime"){
            update += Gift.UDFFIELDS[i].name 
            update += this.udfFields[Gift.UDFFIELDS[i].name] ? " = '" + this.udfFields[Gift.UDFFIELDS[i].name] + "'," : " = null,"            
        }
        else update += Gift.UDFFIELDS[i].name + ' = ' + this.udfFields[Gift.UDFFIELDS[i].name] + ","
    }
    //remove comma at end
    update = update.substring(0, update.length - 1)
    update += " where gift_id = " + gift_id
    dputils.executeNonQuery(update, callback)
}

function buildJoins(from)
{
    var joins = " and ";
    from.forEach(function(el){
        if(el.toLowerCase() === "dpgift") return;
        if(Gift.JOIN_MAP.hasOwnProperty(el.toLowerCase())){
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
* Tet the count of how many records for a query asynchronously
*/
Gift.getCount = function(sql, callback){
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
Gift.handleSaxError = function(e, context){

}

/**
* Handle the open tag event of the sax parser. If the node is a field it will add the value to the object.
* If it is a result it will create a new gift object and push it to the context array
*@param {sax node} n the node that was parsed by sax
*@param {Array} context the array of gifts
*/
Gift.handleSaxOpenTag = function(n, context){
    if(n.name === 'field'){
        // get last item in context and save value
        var gift = context[context.length - 1]

        if(n.attributes.name in gift){
            var field = Gift.FIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value = dputils.convertValue(n.attributes.value, field[0])
            gift[n.attributes.name] = value;
        } 
        else{
            var field = Gift.UDFFIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value;
            if(field.length > 0) value = dputils.convertValue(n.attributes.value, field[0]);
            else value = n.attributes.value;
            gift.udfFields[n.attributes.name] = value;
        } 
    }
    if(n.name === "record") context.push(new Gift());
         
}

Gift.SaveUdf = function(callback){

}
function getByID(ids, callback){
    var sql = "select * from dpgift join dpgiftudf on dpgift.gift_id = dpgiftudf.gift_id where dpgift.gift_id = " + ids;
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
    var sql = "select * from dpgift join dpgiftudf on dpgift.gift_id = dpgiftudf.gift_id where dpgift.gift_id in (" + ids.join() + ")";
    getBySql(sql, callback);
}

function getBySql(ids, callback){
    var sql = ids
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var gifts = [];
    parser.on('error', function(e){ Gift.handleSaxError(e, gifts)})
    parser.on('opentag', function(n){Gift.handleSaxOpenTag(n, gifts)})
    parser.on('end', function(){ callback(null, gifts)}) // return the one array of gifts
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dpURI(sql)).pipe(parser)
}

module.exports.Gift = Gift;