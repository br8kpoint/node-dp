var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'mfair01'
nodedp.credentials.password= 'mfair01'


/**
 * Test that hello() returns the correct string
 */

describe('New Donor', function(){
	var donor = undefined;
	describe('Save()', function(){
		it('should return a new id', function(done){
			donor = new nodedp.donor();
			donor.first_name = 'node-dp'
			donor.last_name = 'test'
			donor.email = 'test@test.com'
			donor.address = 'some address'
			donor.city = 'some city'
			donor.state = 'some state'
			donor.country = 'some country'
			donor.save(function(error, result){
				assert.notEqual(donor.donor_id, 0);
				done();		
			});
			
		});
	});
	after(function(){
		donor.destroy();
	});
});

describe('Donor', function(){
	describe('Query()', function(){
		// test Donor.query menthod
		
		it('should return an array when passed criteria', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: ">",
					value: "3",
					field: {
						source: "dp",
						name: "gifts"
					}
				}
				]
			}
			nodedp.donor.query(options, function(donors){
				//console.log(donors)
				assert.ok(donors instanceof Array);
				done();
			});
		});

		it('should only return 10 items when limited to 10', function(done){
			// dp.gifts > 3
			var options = {
				criteria: [],
				limit: 10,
				offset: 1
			}
			nodedp.donor.query(options, function(donors){
				//console.log(donors)
				assert.ok(donors.length === 10);
				done();
			});
		});

	})
})

describe('Donor', function(){
	describe('Get()', function(){
		// test three methods of get
		it('should return an object when passed an integer', function(done){
			console.log('before donor')
			nodedp.donor.get(1, function(donor){
				console.log('got donor')
				assert.equal(donor.donor_id, 1);
				done();
			});
		});
		it('should return an array when passed a string', function(done){
			nodedp.donor.get("select * from dp where donor_id = 5", function(donors){
				assert.ok(donors instanceof Array);
				done();
			});
		});
		it('should return an array when passed an array',function(done){
			var ids = [1,2,3,4,6];
			nodedp.donor.get(ids, function(donors){
				assert.ok(donors instanceof Array);
				assert.equal(donors.length, 5);
				done();
			});
		});

	})
})

