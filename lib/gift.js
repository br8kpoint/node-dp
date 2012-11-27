var dputils = require('./dp-utils')
    , dpURI = dputils.dpURI
    , check = require('validator').check
    , request = require('request')
/********************************************************************************************************************************
*
* Gifts
*
********************************************************************************************************************************/

function Gift(){
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
}

/**
* Saves a gift to donor perfect
*@param callback the callback to fire once finished saving
*@this {Gift}
*/
Gift.prototype.save = function (callback){
    this.validate();
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
        if(n.name === 'field') self.gift_id = parseInt(n.attributes.value);
    })
    parser.on('end', function(){
        callback && callback(null, self);
    })
    request(dpURI('dp_savegift', params)).pipe(parser)
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
    check(this.record_type, 'Invalid record type.').regex(/[GPS]/);
    check(this.amount, 'Amount must be decimal').isDecimal();
    check(this.split_gift, 'Invalid split gift: must be Y or N').regex(/[YN]/);
    check(this.pledge_payment, 'Invalid pledge payment: must be Y or N').regex(/[YN]/);
    if(this.fmv !== null) check(this.fmv, 'fmv must be decimal').isDecimal();
    check(this.batch_no, 'batch_no must be null or a number').isNumeric();

}


module.exports.Gift = Gift;