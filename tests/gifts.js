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
	describe('Get()', function(){
		it('should get the gifts by donor id', function(done){
			nodedp.gift.getByDonorId(donor.donor_id, function(err, result){
				if(err) console.log(err)
				assert.equal(result.length, 1)
				done();
			})
		})
	})
})

describe('Gift', function(){
	describe('Query()', function(){
		// test Donor.query menthod

		
		it('should only return 10 items when limited to 10', function(done){
			// dp.gifts > 3
			var options = {
				criteria: [],
				limit: 10,
				offset: 1
			}
			nodedp.gift.query(options, function(err, gifts){
				if(err) console.log(err)
				console.log(gifts)
				assert.ok(gifts.results.length === 10);
				done();
			});
		});

	})
})

describe('Gift', function(){
	describe('Get()', function(){
		// test three methods of get
		it('should return an object when passed an integer', function(done){
			console.log('before donor')
			nodedp.gift.get(1, function(err, gift){
				assert.equal(gift.gift_id, 1);
				done();
			});
		});
		it('should return an array when passed a string', function(done){
			nodedp.donor.get("select * from dpgift where donor_id = 3", function(err, donors){
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

