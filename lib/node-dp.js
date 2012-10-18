/**
*  
**/

exports.donor =  Donor;

function Donor(){
	this.donor_id = -1; // new donor
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
    this.donor_type = "";    
    this.nomail = "N";    
    this.nomail_reason = "";    
    this.narrative = "";    
    this.user_id = "";    
    this.other_state_prov = "";
    this.ccInfo = {};
    this.local_id = 0;

}

Donor.prototype.save = function (callback){
	callback();
}

Donor.get = function(ids, callback){
	callback();
}