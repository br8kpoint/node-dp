var csv = require('csv')

csv().from.path(process.argv[2], {columns: true})
	.to.path(process.argv[3])
	.transform(function(data, index){
		for(var field in data){
			if(data[field]){
				data[field] = data[field].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			}
			
		}
		console.log(data);
		return data;
	})