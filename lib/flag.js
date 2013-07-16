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

function Flag(){
    // bootstrap and initialize fields
    for(var i=0; i<Flag.FIELDS.length; i++)
    {
        this[Flag.FIELDS[i].name] = null;
    }
    this.donor_id = null;
    this.flag = null;
    this.import_id = null;
}

Flag.FIELDS = [
{"source":"dpflags","name":"donor_id","type":"numeric","nullable":false,"max":null,"label":"Donor Id","description":"Donor Id"},
{"source":"dpflags","name":"flag","type":"varchar","nullable":false,"max":null,"label":"Flag","description":"Flag"},
{"source":"dpflags","name":"import_id","type":"numeric","nullable":false,"max":null,"label":"Import Id","description":"Import Id"},
]

Flag.DEFINED_FLAGS = {}
Flag.JOIN_MAP = {
    "dp": {
        "source": "dp.donor_id"
        , "dest": "= dpflags.donor_id"
    }
}

Flag.add = function(flags, cb){
    var sql = "INSERT INTO dpflags(donor_id, flag) VALUES"
    if(Array.isArray(flags)){
        flags.forEach(function(el){
            sql += "(" + el.donor_id + ", '" + el.flag + "'),"
        })
        sql = sql.substr(0, sql.length - 1)
    }
    else{
        sql += "(" + flags.donor_id + ", '" + flags.flag + "')"
    }
    dputils.executeNonQuery(sql, function(err, result){
        return cb(err, flags)
    })
}

Flag.remove = function(flag, cb){
    /*sql = "DELETE * FROM dpflags where donor_id = " + flag.donor_id + " and flags"
    if(Array.isArray(flag)){
        sql += " IN (";
        sql += flag.map(function(item){
            return "'" + item.flag + "'"
        }).join()
        sql += ")";
    }
    else
    {
        sql += " = '" + flag.flag + "'"
    }
    dputils.executeNonQuery(sql, cb)
    */
    
    var params = [ 
        flag.donor_id,
        flag.flag
    ]
    var self = this;
    var parser = require('sax').createStream(false, {lowercasetags: true});
    parser.on('error', function(e){
        cb(e, self)
    })
    parser.on('opentag', function(n){
        if(n.name === 'field') {
            flag.donor_id = parseInt(n.attributes.value);
        }
    })
    parser.on('end', function(){
        cb && cb(null, flag);
    })
    var uri = dpURI('dp_delflags_xml', params)
    request(uri).pipe(parser)
}

/**
* Retrieves gifts by donor id from donor perfect
*@param {number} id - number is a donor id
*@param {callback(err, results)} callback = called to pass back results 
*@static
*/
Flag.getByDonorId = function(ids, callback){
    var sql = "select * from dpflags where dpflags.donor_id = " + ids
    getBySql(sql, function(err, flags){
        if(err){
            callback(err, null);
            return;
        }
        callback(null, flags)
    });
}

function getBySql(ids, callback){
    var sql = ids
    var parser = require('sax').createStream(false, {lowercasetags: true});
    var flags = [];
    parser.on('error', function(e){ Flag.handleSaxError(e, flags)})
    parser.on('opentag', function(n){Flag.handleSaxOpenTag(n, flags)})
    parser.on('end', function(){ callback(null, flags)}) // return the one array of flags
    parser.on('text', function(t){console.log(t); callback(new Error(t), null)}) // if we get text then we have an error. All regualr resutls aer in nodes!!
    request(dpURI(sql)).pipe(parser)
}

Flag.handleSaxError = function(e, context){

}

/**
* Handle the open tag event of the sax parser. If the node is a field it will add the value to the object.
* If it is a result it will create a new gift object and push it to the context array
*@param {sax node} n the node that was parsed by sax
*@param {Array} context the array of gifts
*/
Flag.handleSaxOpenTag = function(n, context){
    if(n.name === 'field'){
        // get last item in context and save value
        var flag = context[context.length - 1]

        if(n.attributes.name in flag) flag[n.attributes.name] = n.attributes.value;
    }
    if(n.name === "record") context.push(new Flag());
         
}

module.exports.Flag = Flag;