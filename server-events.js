var fs = require('fs');
	
// error reporting function
function onError(message, exception, response) {
	console.error(message + (exception? " | Exception: " + exception.message: ""));
	if (response) {
		response.status(500).end();
	}
}

// 404 functions
function onNotFound(path, response) {
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

function onAssetNotFound(path, response) {
	console.log("URL not found: <%s>", path);
	response.status(404).end();
}

exports.error = onError;
exports.notFound = onNotFound;
exports.assetNotFound = onAssetNotFound;	
