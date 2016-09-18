"use strict";

var fs = require('fs'),
	path = require('path'),
	functionsPath = './functions',
	functions = require(functionsPath);

// watch functions.js for changes
(function () {
	fs.watch(functionsPath + ".js", function (event, filepath) {
		switch (event) {
			case "change":
				// reload the functions
				try {
					delete require.cache[path.resolve(filepath)];
					functions = require(functionsPath);
				}
				catch (e) {
					on.error("Could not reload <" + functionsPath + ">", e);
				}
				break;
		}
	});
})();

// error reporting function
exports.error = function (message, exception, response) {
	console.error(message + (exception? " | Exception: " + exception.message: ""));
	if (response) {
		response.status(500).end();
	}
}

// 404 functions
exports.notFound = function (path, response) {
	console.log("URL not found: <%s>", path);
	var errorPagePath = "./dist/error.xml";
	fs.readFile(errorPagePath, { encoding: 'utf8' }, function (err, data) {
		if (data) {
			response.status(404)
				.send(data)
				.end();
		}
		else {
			// not found
			response.status(404)
				.send("Website error. Please return to <a href='/'>the homepage</a>.")
				.end();
		}
	})
}

exports.assetNotFound = function (path, response) {
	console.log("URL not found: <%s>", path);
	response.status(404).end();
}

exports.page = function (reqPath, req, res) {
	// normalize the file path to remove . and ..
	var reqPath = path.normalize(reqPath);
	if (reqPath.search(/^([\\\/][-a-zA-Z0-9]+)*[\\\/]?$/) < 0 ) {
		exports.error("Illegal request path <" + reqPath + ">. Aborting request.");
		exports.notFound(reqPath, res);
		return;
	}
	var distPath = "./dist" + reqPath + ".xml";
	
	fs.readFile(distPath, { encoding: 'utf8' }, function (err, data) {
		if (data) {
			try { // prevent the server from crashing when there is an error
				// handle any relevant processing instructions
				data = data.replace(/<\?server\s+([a-zA-Z]+)\?>/g, function (match, c1) {
					return (functions.hasOwnProperty(c1)? functions[c1].apply(null, [req, res]) : '');
				});
				// make sure one of the called functions hasn't already sent data (usually a redirect)
				if (!res.headersSent)
					res.send(data);
				res.end();
			}
			catch(e) {
				on.error("The server encountered an error while processing <"+ distPath + ">", e, res);
			}
		}
		else {
			// not found
			exports.notFound(distPath, res);
		}
	});
}

function streamAsset(translatedPath, response) {
	// make sure the file exists
	fs.stat(translatedPath, function (err, stats) {
		if (stats) {
			// then stream it to the client
			var file_stream = fs.createReadStream(translatedPath);
			file_stream.on('error', function () {
				exports.error("Could not read and send asset file <" + translatedPath + ">", null, response);
			});
			file_stream.pipe(response);
		}
		else {
			exports.assetNotFound(translatedPath, response);
		}
	});
}

exports.asset = function (req, res) {
	// normalize the file path to remove . and ..
	var reqPath = path.normalize(req.path);
	if (reqPath.search(/^[\\\/]assets([\\\/][-a-zA-Z0-9]+)+(\.[a-zA-Z0-9]+)+$/) < 0 ) {
		exports.error("Illegal request path <" + reqPath + ">. Aborting request.");
		exports.assetNotFound(req.path, res);
		return;
	}
	// continue to validate and parse the requested path
	var fileExtension = path.extname(req.path);
	if (fileExtension && 
		fileExtension.match(/\.(jpg|png|gif|svg|js|css|map)/)) {
		// set the mime type
		res.type(fileExtension);
		// set the caching headers
		res.set({
			'Cache-Control': 'max-age=604800, public'
		});
	}
	else {
		exports.error("Unrecognized file extension <" + fileExtension + ">");
		exports.assetNotFound(req.path, res);
		return;
	}
	var translatedPath = "./dist" + req.path;
	
	streamAsset(translatedPath, res);
}

exports.sitemap = function (req, res) {
	streamAsset("./dist/sitemap.xml", res);
}

exports.robots = function (req, res) {
	streamAsset("./dist/robots.txt", res);
}
