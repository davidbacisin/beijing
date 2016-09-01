var on = require('./server-events'),
	fs = require('fs'),
	path = require('path');

function processRequest(req, res) {
	// normalize the file path to remove . and ..
	var reqPath = path.normalize(req.path);
	if (reqPath.search(/^([\\\/][-a-zA-Z0-9]+)+(\.[a-zA-Z0-9]+)+$/) < 0 ) {
		on.error("Illegal request path <" + reqPath + ">. Aborting request.");
		on.assetNotFound(req.path, res);
		return;
	}
	// continue to validate and parse the requested path
	var fileExtension = path.extname(req.path);
	if (fileExtension && 
		fileExtension.match(/\.(jpg|png|gif|svg|js|css|otf|ttf|eot|woff|map|pdf)/)) {
		// set the mime type
		res.type(fileExtension);
		// set the caching headers
		res.set({
			'Cache-Control': 'max-age=604800, public'
		});
	}
	else {
		on.error("Unrecognized file extension <" + fileExtension + ">");
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
				on.error("Could not read and send asset file <" + translatedPath + ">", null, res);
			});
			file_stream.pipe(res);
		}
		else {
			on.assetNotFound(translatedPath, res);
		}
	});
}

exports.processRequest = processRequest;