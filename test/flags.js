var assert = require ('assert')
    , nodedp = require('../lib/node-dp')
    , dateutils = require("date-utils")

nodedp.credentials.username = 'mfair02'
nodedp.credentials.password= 'mfair02'

describe('Add Flags', function(){
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
	describe('Add()',function(){
		it('should add a flag', function(done){
			debugger;
			var fcount = donor.flags.length;
			donor.addFlag("AL", function(err, result){
				assert.equal(donor.flags.length, fcount + 1)
				done()	
			})
			
		});
	})
})
describe ('Retrieve Flags', function(){
	it('should retrieve the flags when getting a donor', function(done){
		var donor = nodedp.donor.get(405, function(err, donor){
			console.log("donor:")
			console.log(donor)
			assert(donor.flags.length > 0)
			done()
		})
	})
	
})
describe('Remove Flags', function(){
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

	describe('Remove()',function(){
		it('should remove a flag', function(done){
			donor.addFlag("AL", function(err, result){
				var fcount = donor.flags.length;
				nodedp.flag.remove(donor.flags[0], function(err, result){
					nodedp.donor.get(donor.donor_id, function(err, d){
						assert(d.donor_id == donor.donor_id)
						assert(d.flags.length == fcount - 1)
						done()	
					})
					
				})
			})
			
		});
	})
})