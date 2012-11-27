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
donor.email = 'test@something.com'
donor.address = 'some address';
donor.city = 'some city';
donor.state = 'some state';
donor.country = 'some country';
donor.save(function(error, result){
	if(error) console.log(error);
	else{
		console.log(result)
		//  WATCH OUT FOR ASYNCHRONOUS PROGRAMMING now that we've saved the donor, we can save the gift
		var gift = new nodedp.gift();
		gift.donor_id = donor.donor_id;
		gift.amount = 10.0;
		gift.save(function saveGift(error, result){
			console.log(result);
		})
	}
})

