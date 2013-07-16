var assert = require ('assert'),
    nodedp = require('../lib/node-dp');

nodedp.credentials.username = 'mfair02'
nodedp.credentials.password= 'mfair02'


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
	});
	
});