var csv = require('csv')

console.log("<select>")
csv().from.path(process.argv[2], {columns: true})
	.transform(function(data, index){
		
		console.log('<option value="'+data.code+ '">'+ data.description+ '</option>')
		return data
	})
	.on('end', function(){
		console.log('</select>')
	})