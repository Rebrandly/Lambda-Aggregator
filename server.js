/*
 * Lambda Aggregator
 *
 * Developers: Ryan Steve D'Souza
 * http://www.linkedin.com/profile/view?id=282676120
 *
 * Copyright 2015
 *
 * Date: 2015
 */

// Load the http module to create an http server. 
var http = require('http');
// Load my custom crawl object
var LambdaCrawl = require('./js/module/LambdaCrawl.js');
// Load file writer
var fs = require('fs');
// Load common functions
var common = require('./js/common/common.js');

// rotate sites every 10 seconds
var ROTATION_FREQUENCY = 10; 

// dynamically load all modules from directory and create the list of crawl instances
var siteDir = './js/sites/', crawlLooper = [];
fs.readdirSync(siteDir).forEach(function(file) {
	if (file.charAt(0) != "_") {
		var site = require(siteDir + file);
		var crawler = new LambdaCrawl(site);
		crawlLooper.push(crawler);
	}
});

// rotate the site in each interval. Has tolerance for checking it should be done.
// past tolerance and it assumes the site is fully crawled
if (crawlLooper.length > 0) {	
	crawlLooper[0].scan();

	var INTERVAL = setInterval(function() { 
		var crawler = crawlLooper[0];
		if (crawler.isFinished()) {
			crawlLooper.shift();
		}
		if (crawlLooper.length == 0) {
			clearInterval(INTERVAL);
			console.log("All sites finished crawling");
		} else {
			console.log("Rotating sites...");
			if (crawler.readyToCrawl()) {
				crawler.scan();
			}
			crawlLooper.push(crawlLooper.shift());
		}
	}, ROTATION_FREQUENCY * 1000); 
} else {
	console.log("No sites to crawl...");
}

// Configure our HTTP server to respond to all requests.
var server = http.createServer(function (req, res) {

	// respond type, for now it only gives back plain text
	res.writeHead(200, {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"Content-Type": "application/json; charset=UTF-8"
	});
	
	res.write(JSON.stringify({
		response : crawlLooper
	}));

	res.end();
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");