var request = require('request')
var _       = require('underscore')
var fs      = require('fs-extra')

var urlTpl  = 'https://react.parts/native?page=<%= page %>'
var page    = 1

var components = []

fetch()

function fetch(){
	var url = _.template(urlTpl)({page: page})
	console.log(`fetching url: ${url}`)
	//request.get(url).on('response', onFetchSuccess).on('error', onFetchError)
	request.get({url: url}, onFetchSuccess)
}

function onFetchError(err){
	console.log(`fetch page: ${page} error: `, err)
}

function onFetchSuccess(error, response, body){
//function onFetchSuccess(response){
	if(error) return onFetchError(error)
	if(response.statusCode != 200) return console.warn(response)
	
	try{
		var json = body.match(/window\.initialData = (.+);/)[1]
		var data = JSON.parse(json)
		if(data.initialComponents.length > 0){
			components = components.concat(data.initialComponents)

			fs.outputFileSync(`./native-page-${page}.json`, JSON.stringify(data, null, 4))
		}
		if(data.initialComponents.length == data.perPage){
			page++
			fetch()
		}
		else{
			onFetchedAllComponents()
		}
		//console.log(json)
	}
	catch(e){
		console.error(e)
	}
}

function onFetchedAllComponents(){
	var err
	components = _.sortBy(components, 'stars').reverse()
	err = fs.outputFileSync('./native-by-stars.js', `window.components = ${JSON.stringify(components, null, 4)}`)

	console.log(`native components sorted by stars write to JSON files successfully`)

	components = _.sortBy(components, 'downloads').reverse()
	err = fs.outputFileSync('./native-by-downloads.js', `window.components = ${JSON.stringify(components, null, 4)}`)

	console.log(`native components sorted by downloads write to JSON files successfully`)
}
