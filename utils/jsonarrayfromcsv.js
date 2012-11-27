var csv = require('csv')

console.log("[")
csv().from.path(process.argv[2], {columns: true})
	.transform(function(data, index){
		data.max = parseInt(data.max)
		data.nullable = data.nullable == "YES" ? true : false
		// remove any _ and capitalize for label
		data.label = data.name.replace(/_/g, " ").replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		// set description to label
		data.description = data.label
		console.log(JSON.stringify(data)+ ",")
		return data
	})
	.on('end', function(){
		console.log(']')
	})