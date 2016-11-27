const fetch = require('node-fetch')
const TOKEN = require('config').get('witToken')
const fs = require('fs')
let movies = fs.readFileSync('movies.txt','utf8').split('\n')


let obj ={ "id":"movies",
   			"values":movies.map(movie=>({value:movie}))
   		}
fetch('https://api.wit.ai/entities?v=20160526',{
	method:'POST',
	headers:{
		'Authorization': `Bearer ${TOKEN}`,
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(obj)
}).then(resp => resp.json())
	.then(console.log)
	.catch(console.log)