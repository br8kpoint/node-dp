var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

/**
 * Test that hello() returns the correct string
 */

describe('New Donor', function(){
	describe('Save()', function(){
		it('should return a new id', function(done){
			var donor = new nodedp.donor();
			donor.save(function(){
				assert.notEqual(donor.donor_id, -1);
				done();		
			});
			
		});
	});
});

describe('Donor', function(){
	describe('Get()', function(){
		// test three methods of get
		it('should return an object when passed an integer', function(done){
			var donor = nodedp.donor.get(7, function(){
				assert.equal(donor.donor_id, 7);
				done();
			});
		});
		it('should return an array when passed a string', function(done){
			var donors = nodedp.donor.get("some sql string", function(){
				assert.ok(donors instanceof Array);
				done();
			});
		});
		it('should return an array when passed an array',function(done){
			var ids = [40, 28, 23567];
			var donors = nodedp.donor.get(ids, function(){
				assert.ok(donors instanceof Array);
				assert.equals(donors.length, 3);
				for(var i = 0; i< donors.length; i++)
				{
					assert.equals(donors[i].donor_id, ids[i]);
				}
				done();
			});
		});

	})
})