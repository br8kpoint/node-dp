var nodedp = require('../lib/node-dp')
	
// setup credentials

nodedp.credentials.username = 'biblexmladmin'
nodedp.credentials.password = 'xmladmin'
// get a donor by an id

nodedp.donor.get(3695, function(donor){
	console.log("Donor: %j", donor);	
})

nodedp.donor.get([3695, 9792, 4368, 131206], function(donors){
	console.log("Donors: %j", donors)	
})

//save a donor
var donor = new nodedp.donor();
donor.first_name = 'node-dp'
donor.last_name = 'test'
donor.save(function(error, result){
	console.log(result)
})