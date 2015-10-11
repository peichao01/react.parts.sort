var request = require('request')
var fs      = require('fs-extra')
var path    = require('path')

var page    = 1

var components = []

fetch()

function fetch(){
	var url = 'https://react.parts/native?page='+page
	console.log(`fetching url: ${url}`)

	request.get({url: url}, onFetchSuccess)
}

function onFetchError(err){
	console.log(`fetch page: ${page} error: `, err)
}

function onFetchSuccess(error, response, body){
	if(error) return onFetchError(error)
	if(response.statusCode != 200) return console.warn(response)
	
	try{
		var json = body.match(/window\.initialData = (.+);/)[1]
		var data = JSON.parse(json)
		if(data.initialComponents.length > 0){
			components = components.concat(data.initialComponents)

			fs.outputFileSync(path.join(__dirname, `../json/native-page-${page}.json`), JSON.stringify(data, null, 4))
		}
		if(data.initialComponents.length == data.perPage){
			page++
			fetch()
		}
		else{
			onFetchedAllComponents()
		}
	}
	catch(e){
		console.error(e)
	}
}

function onFetchedAllComponents(){
	var err
	err = fs.outputFileSync(path.join(__dirname, '../native.js'), `window.components = ${JSON.stringify(components, null, 4)}`)

	console.log(`native components write to JSON files successfully`)
}
