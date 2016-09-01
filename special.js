var on = require('./server-events'),
	fs = require('fs'),
	path = require('path');

function processRequest(req, res) {
	// normalize the file path to remove . and ..
	var reqPath = path.normalize(req.path);
	if (reqPath.search(/^[\\\/]([-a-zA-Z0-9]+[\\\/])*(sitemap\.xml|robots\.txt|google[0-9a-f]+\.html)$/) < 0 ) {
		on.error("Illegal request path <" + reqPath + "> for special handler. Aborting request.");
		on.assetNotFound(req.path, res);
		return;
	}
	var translatedPath = "./dist" + req.path;
	
	fs.stat(translatedPath, function (err, stats) {
		if (stats) {
			// try to send the file
			// console.log("Sending " + translatedPath);
			var file_stream = fs.createReadStream(translatedPath);
			file_stream.on('error', function () {
				on.error("Could not read and send special file <" + translatedPath + ">", null, res);
			});
			file_stream.pipe(res);
		}
		else {
			on.assetNotFound(translatedPath, res);
		}
	});
}

exports.processRequest = processRequest;
