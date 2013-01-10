var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'biblexmladmin'
nodedp.credentials.password= 'xmladmin'


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
		
		it('should return an object with results when passed criteria', function(done){
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
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				done();
			});
		});

		it('should return an object with results when passed CONAINS query', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "LIKE",
					value: "node-dp",
					field: {
						source: "dp",
						name: "first_name",
						type: "varchar"
					}
				}
				]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				assert.equal(options.criteria[0].value, "%node-dp%")
				done();
			});
		});

		it('should return an object with results when passed NOT CONAINS query', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "NOT LIKE",
					value: "node-dp",
					field: {
						source: "dp",
						name: "first_name",
						type: "varchar"
					}
				}
				]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				assert.equal(options.criteria[0].value, "%node-dp%")
				done();
			});
		});

		it('should return an object with results when passed STARTSWITH query', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "STARTSWITH",
					value: "node-dp",
					field: {
						source: "dp",
						name: "first_name",
						type: "varchar"
					}
				}
				]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				assert.equal(options.criteria[0].value, "node-dp%")
				assert.equal(options.criteria[0].opperand, "LIKE")
				done();
			});
		});
		it('should return an object with results when passed ENDSWITH query', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "ENDSWITH",
					value: "node-dp",
					field: {
						source: "dp",
						name: "first_name",
						type: "varchar"
					}
				}
				]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				assert.equal(options.criteria[0].value, "%node-dp")
				assert.equal(options.criteria[0].opperand, "LIKE")
				done();
			});
		});
		it('should return an object with results when passed a complex query', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "ENDSWITH",
					value: "node-dp",
					field: {
						source: "dp",
						name: "first_name",
						type: "varchar"
					}
				},
				],
				where: "dpudf.FUNDRAISERS IS NULL",
				from: ["dpudf"]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				assert.equal(options.criteria[0].value, "%node-dp")
				assert.equal(options.criteria[0].opperand, "LIKE")
				done();
			});
		});
		it('should quote values when required', function(done){
			// dp.gifts > 3
			var options = {
				criteria:[{
					opperand: "=",
					value: "nodedp",
					field: {
						source: "dp",
						name: "first_name",
						type: 'varchar'
					}
				}
				]
			}
			nodedp.donor.query(options, function(err, donors){
				//console.log(donors)
				assert.ok(donors.results instanceof Array);
				done();
			});
		});

		it('should only return 10 items or less when limited to 10', function(done){
			// dp.gifts > 3
			var options = {
				criteria: [],
				limit: 10,
				offset: 1
			}
			nodedp.donor.query(options, function(err, donors){
				console.log(donors)
				assert.ok(donors.results.length <= 10);
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
			nodedp.donor.get(1, function(err, donor){
				assert.equal(donor.donor_id, 1);
				done();
			});
		});
		it('should return an array when passed a string', function(done){
			nodedp.donor.get("select * from dp where donor_id = 5", function(err, donors){
				assert.ok(donors instanceof Array);
				done();
			});
		});
		it('should return an array when passed an array',function(done){
			var ids = [1,2,3,4,6];
			nodedp.donor.get(ids, function(err, donors){
				assert.ok(donors instanceof Array);
				assert.equal(donors.length, 5);
				done();
			});
		});

	})
})

