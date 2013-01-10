var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'mfair01'
nodedp.credentials.password= 'mfair01'


/**
 * Test that hello() returns the correct string
 */

describe('Utilities', function(){
	describe('Save()', function(){
		it('should execute non queries', function(done){
			var sql = "UPDATE DPUDF SET FUNDRAISERS = 'CALLER1' WHERE FUNDRAISERS IS NULL"
			var options={
				limit: 1
				, where: "DPUDF.FUNDRAISERS IS NULL"
				, from: ['dpudf']
			}
			nodedp.donor.query(options, function(err, results){
				if(!err)
				{
					nodedp.nonQuery(sql, function(err, result){
						if(!err) done();
						else done(err);
					})
				}
			})
			
		});

		it('should throw an error on bad query input', function(done){
			var sql = "SELECT * FROM NONEXISTENTTABLE";
			nodedp.donor.get(sql, function(err, results){
				assert.equal(results, null)
				done();
			})
		})
	});
	
});