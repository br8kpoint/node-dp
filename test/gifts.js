var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'mfair01'
nodedp.credentials.password= 'mfair01'

describe('New Gift', function(){
	var donor = undefined;
	before(function(done){
		donor = new nodedp.donor();
		donor.first_name = 'node-dp gift'
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
			var gift = new nodedp.gift();
			gift.donor_id = donor.donor_id;
			gift.amount = 10.0;
			gift.gift_date = new Date();
			gift.save(function(error, result){
				assert.notEqual(gift.gift_id, 0);
				done();		
			});
			
		});
	})
})