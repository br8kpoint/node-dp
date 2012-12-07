var assert = require ('assert')
    , nodedp = require('../lib/node-dp')
    , dateutils = require("date-utils")

nodedp.credentials.username = 'mfair01'
nodedp.credentials.password= 'mfair01'

describe('New Contact', function(){
	var donor = undefined;
	before(function(done){
		donor = new nodedp.donor();
		donor.first_name = 'node-dp contact'
		donor.last_name = 'test'
		donor.email = 'test@test.com'
		donor.address = 'some address'
		donor.city = 'some city'
		donor.state = 'some state'
		donor.country = 'some country'
		donor.save(function(error, result){
			if(!error) donor = result;
			done();
		});
	});
	after(function(){
		donor.destroy();
	});
	describe('Save()',function(){
		it('should return a new id', function(done){
			var contact = new nodedp.contact();
			contact.donor_id = donor.donor_id;
			contact.date = Date.today();
			contact.due_date = Date.tomorrow();
			contact.comment = "This is a comment";
			contact.activity_code = "SOMECODE";
			contact.mailing_code = "SOMEMAINGCODE";
			contact.by_whom = "DAPAPI"
			contact.save(function(error, result){
				assert.notEqual(contact.contact_id, 0);
				done();		
			});
			
		});
	})
})