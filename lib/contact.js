var events = require('events'),
    request = require('request'),
    check = require('validator').check,
    extend = require('xtend'),
    dputils = require('./dp-utils'),
    dpURI = dputils.dpURI,
    moment = require('moment');
    

/********************************************************************************************************************************
*
* Contact
*
********************************************************************************************************************************/

/**
* Represents a Contact record from donor perfect
*@constructor
*@this {Contact}
*/
function Contact(){
    var self = this;
    // bootstrap and initialize fields
    for(var i=0; i<Contact.FIELDS.length; i++)
    {
        this[Contact.FIELDS[i].name] = null;
    }
    // set sensible defaults for contact
	this.contact_id = 0; // new contact
	this.contact_date = new Date();
    this.donor_id = null;
    this.due_date = null;
    this.completed_date = null;
    this.comment = "";
    this.by_whom = null;
    this.activity_code = null;
    this.mailing_code = null;
    this.document_path = null;
    this.created_by=null;
    this.created_date = new Date();
    this.modified_by = null;
    this.modified_date = this.created_date;
    this.due_time = "";
    this.gift_id = null;
    this.pledge_id = null;
    this.user_id = dputils.credentials.username;     // set user to node-dp username
    this.udfFields = {}

}

/*
* Contact fields. An array of objects of the form {}
*/

Contact.FIELDS = [
{"source":"dpcontact","name":"contact_id","type":"numeric","nullable":false,"max":null,"label":"Contact Id","description":"Contact Id"},
{"source":"dpcontact","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
{"source":"dpcontact","name":"contact_date","type":"datetime","nullable":true,"max":null,"label":"Contact Date","description":"Contact Date"},
{"source":"dpcontact","name":"due_date","type":"datetime","nullable":true,"max":null,"label":"Due Date","description":"Due Date"},
{"source":"dpcontact","name":"completed_date","type":"datetime","nullable":true,"max":null,"label":"Completed Date","description":"Completed Date"},
{"source":"dpcontact","name":"comment","type":"varchar","nullable":true,"max":8000,"label":"Comment","description":"Comment"},
{"source":"dpcontact","name":"by_whom","type":"varchar","nullable":true,"max":30,"label":"By Whom","description":"By Whom"},
{"source":"dpcontact","name":"activity_code","type":"varchar","nullable":true,"max":30,"label":"Activity Code","description":"Activity Code"},
{"source":"dpcontact","name":"mailing_code","type":"varchar","nullable":true,"max":30,"label":"Mailing Code","description":"Mailing Code"},
{"source":"dpcontact","name":"document_path","type":"varchar","nullable":true,"max":200,"label":"Document Path","description":"Document Path"},
{"source":"dpcontact","name":"created_by","type":"varchar","nullable":true,"max":20,"label":"Created By","description":"Created By"},
{"source":"dpcontact","name":"created_date","type":"datetime","nullable":true,"max":null,"label":"Created Date","description":"Created Date"},
{"source":"dpcontact","name":"modified_by","type":"varchar","nullable":true,"max":20,"label":"Modified By","description":"Modified By"},
{"source":"dpcontact","name":"modified_date","type":"datetime","nullable":true,"max":null,"label":"Modified Date","description":"Modified Date"},
{"source":"dpcontact","name":"due_time","type":"varchar","nullable":true,"max":20,"label":"Due Time","description":"Due Time"},
{"source":"dpcontact","name":"gift_id","type":"numeric","nullable":true,"max":null,"label":"Gift Id","description":"Gift Id"},
{"source":"dpcontact","name":"pledge_id","type":"numeric","nullable":true,"max":null,"label":"Pledge Id","description":"Pledge Id"},
{"source":"dpcontact","name":"plan_id","type":"numeric","nullable":true,"max":null,"label":"Plan Id","description":"Plan Id"},
{"source":"dpcontact","name":"plan_action_num","type":"numeric","nullable":true,"max":null,"label":"Plan Action Num","description":"Plan Action Num"},
{"source":"dpcontact","name":"import_id","type":"numeric","nullable":true,"max":null,"label":"Import Id","description":"Import Id"},
{"source":"dpcontact","name":"em_campaign","type":"varchar","nullable":true,"max":200,"label":"Em Campaign","description":"Em Campaign"},
{"source":"dpcontact","name":"em_campaign_status","type":"varchar","nullable":true,"max":200,"label":"Em Campaign Status","description":"Em Campaign Status"},
{"source":"dpcontact","name":"em_bounce_reason","type":"varchar","nullable":true,"max":200,"label":"Em Bounce Reason","description":"Em Bounce Reason"},
{"source":"dpcontact","name":"em_campaign_id","type":"bigint","nullable":true,"max":null,"label":"Em Campaign Id","description":"Em Campaign Id"},
{"source":"dpcontact","name":"cc_event_import_time","type":"datetime","nullable":true,"max":null,"label":"Cc Event Import Time","description":"Cc Event Import Time"},
{"source":"dpcontact","name":"contact_email","type":"varchar","nullable":true,"max":300,"label":"Contact Email","description":"Contact Email"},
{"source":"dpcontact","name":"contact_state","type":"varchar","nullable":true,"max":200,"label":"Contact State","description":"Contact State"},
{"source":"dpcontact","name":"em_event_status_date","type":"varchar","nullable":true,"max":200,"label":"Em Event Status Date","description":"Em Event Status Date"},
{"source":"dpcontact","name":"event_id","type":"numeric","nullable":true,"max":null,"label":"Event Id","description":"Event Id"},
{"source":"dpcontact","name":"event_response","type":"varchar","nullable":true,"max":30,"label":"Event Response","description":"Event Response"},
{"source":"dpcontact","name":"invite_date","type":"datetime","nullable":true,"max":null,"label":"Invite Date","description":"Invite Date"},
{"source":"dpcontact","name":"response_date","type":"datetime","nullable":true,"max":null,"label":"Response Date","description":"Response Date"},
{"source":"dpcontact","name":"evtdet_id","type":"numeric","nullable":true,"max":null,"label":"Evtdet Id","description":"Evtdet Id"},
{"source":"dpcontact","name":"evt_resp","type":"varchar","nullable":true,"max":30,"label":"Evt Resp","description":"Evt Resp"},
{"source":"dpcontact","name":"invite_dt","type":"datetime","nullable":true,"max":null,"label":"Invite Dt","description":"Invite Dt"},
{"source":"dpcontact","name":"resp_dt","type":"datetime","nullable":true,"max":null,"label":"Resp Dt","description":"Resp Dt"},
{"source":"dpcontact","name":"segmentsplit_id","type":"int","nullable":false,"max":null,"label":"Segmentsplit Id","description":"Segmentsplit Id"},
{"source":"dpcontact","name":"segmentation_id","type":"int","nullable":false,"max":null,"label":"Segmentation Id","description":"Segmentation Id"},
]

Contact.UDFFIELDS=[
{"source":"dpcontactudf","name":"FROM_CALLCENTER","type":"varchar","nullable":false,"max":1,"label":"From Call Center","description":"This contact came from the call center"},
]

Contact.JOIN_MAP = {
    "dpudf": {
        "source": "dpcontact.donor_id"
        , "dest": "= dpudf.donor_id"
    }
    , "dpgift": {
        "source": "dpcontact.donor_id"
        , "dest": "= dpgift.donor_id"
    }
    , "dp":{
        "source": "dp.donor_id"
        , "dest": "= dpcontact.donor_id"
    }
}

Contact.QUERY_FIELDS = Contact.FIELDS

Contact.prototype.saveUdf = function(contact_id, callback){
    //only save fields in udf that are defined for the system if a new field is added in dp it MUST be defined in Contact.UDFFIELDS above
    var update = "UPDATE dpcontactudf set "
    for(var i = 0; i < Contact.UDFFIELDS.length; i++){
       if(Contact.UDFFIELDS[i].type == "varchar" || Contact.UDFFIELDS[i].type == "datetime"){
            update += Contact.UDFFIELDS[i].name 
            update += this.udfFields[Contact.UDFFIELDS[i].name] ? " = '" + this.udfFields[Contact.UDFFIELDS[i].name] + "'," : " = null,"            
        }
        else update += Contact.UDFFIELDS[i].name + ' = ' + this.udfFields[Contact.UDFFIELDS[i].name] + ","
    }
    //remove comma at end
    update = update.substring(0, update.length - 1)
    update += " where contact_id = " + contact_id
    dputils.executeNonQuery(update, callback)
}

/**
* Saves a contact to donor perfect
*@param callback the callback to fire once finished saving
*@this {Contact}
*/
Contact.prototype.save = function (callback){
    this.validate();
    // ensure contact date is in correct format for dp
    var saved_contact_date = this.contact_date;
    var moment_date = moment(this.contact_date);
    if(!moment_date.isValid()) moment_date = moment(this.contact_date.toString(), "MM/dd/yyyy");
    this.contact_date = moment_date.format("MM/dd/yyyy");
    var params = [ this.contact_id
        , this.donor_id
        , this.activity_code
        , this.mailing_code
        , this.by_whom
        , this.contact_date
        , this.due_date
        , this.due_time
        , this.completed_date
        , this.comment
        , this.document_path
        , this.user_id
    ]
    var self = this;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var err = null;
    parser.on('error', function(e){
        callback(e, self)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field') {
            self.contact_id = parseInt(n.attributes.value);
        }
    })
    parser.on('text', function(t){console.log(t); err = new Error(t);}) // if we get text then we have an error. All regular resutls are in nodes!!
    parser.on('end', function(){
	self.contact_date = saved_contact_date;
        if(err) return callback && callback(err, null);
        self.saveUdf(self.contact_id, function(err,result){
            callback && callback(err, self);
        })
    })
    request(dpURI('dp_savecontact', params)).pipe(parser)
}

/**
* Check to see if the contact has been saved or not
*@returns true if the contact has not been saved, false if the contact is not new
*/
Contact.prototype.isNew = function(){
    return this.contact_id !== 0;
}


/**
* Validate the Contact
* @throws an error on failure
*/
Contact.prototype.validate = function(){
    check(this.donor_id, 'Please enter a donor id.').notNull();

}


/** Not sure if we can actaully peform destroy on contacts

Contact.prototype.destroy = function(callback){
    var params = [this.donor_id];
    request(dpURI("dp_del_xml_donor", params), function(error, response, body){
        if (!error && response.statusCode == 200) {
            callback && callback(body);      // if they don't care we don't
        }
    })
}

*/

/**
* Retrieves a contact or contacts from donor perfect
*@param {number|[numbers]|string} ids - number is a single id, numbers is an array of ids, string is an sql query
*@param {callback} callback = called to pass back results 
*@static
*/
Contact.get = function(ids, callback){
    if(typeof ids === 'number') getByID(ids, callback);
    if(ids instanceof Array) getByArray(ids, callback);
    if(typeof ids === 'string') getBySql(ids, callback);
}


/**
* Retrieves contacts by donor id from donor perfect
*@param {number} id - number is a donor id
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Contact.getByDonorId = function(ids, callback){
    var sql = "select * from dpcontact join dpcontactudf on dpcontact.contact_id = dpcontactudf.contact_id where dpcontactudf.FROM_CALLCENTER = 'N' AND dpcontact.donor_id = " + ids + " order by dpcontact.contact_date desc";
    getBySql(sql, function(err, contacts){
        if(err){
            callback(err, null);
            return;
        }
        callback(null, contacts)
    });
}

Contact.QUERY_DEFAULTS = {
    criteria: [],               // array of {opperand: "", value: "", field:{source:"", name:""}}
    offset: 0,
    orderBy: "dpcontact.contact_id",     // fully qualified table.fieldname
    groupBy: null,
    having: null
}

/**
* Retrieves contacts that match the options
* @param {options} an array of criteria objects which has at least {criteria:[{field - see above}, operand, value}]}
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Contact.query = function(options, callback){
    try
    {
        options = extend(Contact.QUERY_DEFAULTS, options)

        var from = ["dpcontact"];
        var where = " where ";
        var orderBy = options.orderBy || "dpcontact.contact_id"
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
        var sql = "select row_number() over (order by "+ orderBy + ") as rid, dp.* from " + from.join(", ") + where;
        if(options.limit){
            sql = "select * from (" + sql + ") as innerselect where rid between " + options.offset + " and " + (options.offset + options.limit - 1)   
        }

        if(dputils.debug) console.log(sql)
        var countsql = "select count(*) from " + from.join(", ") + where;
        if(dputils.debug) console.log(countsql);
        Contact.getCount(countsql, function(err, total){
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

function buildJoins(from)
{
    var joins = " and ";
    from.forEach(function(el){
        if(el.toLowerCase() === "dp") return;
        if(Donor.JOIN_MAP.hasOwnProperty(el.toLowerCase())){
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
Contact.getCount = function(sql, callback){
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
Contact.handleSaxError = function(e, context){

}

/**
* Handle the open tag event of the sax parser. If the node is a field it will add the value to the object.
* If it is a result it will create a new contact object and push it to the context array
*@param {sax node} n the node that was parsed by sax
*@param {Array} context the array of donors
*/
Contact.handleSaxOpenTag = function(n, context){
    if(n.name === 'field'){
        // get last item in context and save value
        var contact = context[context.length - 1]
        if(!contact) return;
        if(n.attributes.name in contact){
            var field = Contact.FIELDS.filter(function(item){
                return item.name == n.attributes.name;
            })
            var value = dputils.convertValue(n.attributes.value, field[0])
            contact[n.attributes.name] = value;
        } 
        else contact.udfFields[n.attributes.name] = n.attributes.value;
    }
    if(n.name === "record") context.push(new Contact());
         
}


function getByID(ids, callback){
    var sql = "select * from dpcontact join dpcontactudf on dpcontact.contact_id = dpcontactudf.contact_id where dpcontact.contact_id = " + ids;
    getBySql(sql, function(err, contacts){
        if(err){
            callback(err, null);
            return;
        }
        if(contacts.length == 0){
            return callback(new Error(ids + " not found"), null)
        }
        if(contacts.length != 1)
        {
            callback(new Error("Found more than one contact for id: " + ids), null)
            return;
        }
        callback(null, contacts[0])
    });
}

function getByArray(ids, callback){
    var sql = "select * from dpcontact join dpcontactudf on dpcontact.contact_id = dpcontactudf.contact_id where dp.contact_id in (" + ids.join() + ")";
    getBySql(sql, callback);
}

function getBySql(ids, callback){
    var sql = ids
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var contacts = [];
    parser.on('error', function(e){ Contact.handleSaxError(e, contacts)})
    parser.on('opentag', function(n){Contact.handleSaxOpenTag(n, contacts)})
    parser.on('end', function(){ callback(null, contacts)}) // return the results
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dpURI(sql)).pipe(parser)
}

module.exports.Contact = Contact
