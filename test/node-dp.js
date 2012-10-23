var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'biblexmladmin'
nodedp.credentials.password= 'xmladmin'
/**
 * Test that hello() returns the correct string
 */

describe('New Donor', function(){
	describe('Save()', function(){
		it('should return a new id', function(done){
			var donor = new nodedp.donor();
			donor.first_name = 'node-dp'
			donor.last_name = 'test'
			donor.email = 'test@test.com'
			donor.address = 'some address'
			donor.city = 'some city'
			donor.state = 'some state'
			donor.country = 'some country'
			donor.save(function(error, result){
				assert.notEqual(result.donor_id, -1);
				done();		
			});
			
		});
	});
});

describe('Donor', function(){
	describe('Get()', function(){
		// test three methods of get
		it('should return an object when passed an integer', function(done){
			console.log('before donor')
			nodedp.donor.get(3695, function(donor){
				console.log('got donor')
				assert.equal(donor.donor_id, 3695);
				done();
			});
		});
		it('should return an array when passed a string', function(done){
			nodedp.donor.get("select * from dp where donor_id = 3695", function(donors){
				assert.ok(donors instanceof Array);
				done();
			});
		});
		it('should return an array when passed an array',function(done){
			var ids = [3695, 9792, 4368, 131206, 190136];
			nodedp.donor.get(ids, function(donors){
				assert.ok(donors instanceof Array);
				assert.equal(donors.length, 5);
				done();
			});
		});

	})
})