var on = require('./server-events'),
	fs = require('fs'),
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

function processRequest(req, res) {
	// normalize the file path to remove . and ..
	var reqPath = path.normalize(req.path);
	if (reqPath.search(/^([\\\/][-a-zA-Z0-9]+)*[\\\/]?$/) < 0 ) {
		on.error("Illegal request path <" + reqPath + ">. Aborting request.");
		on.notFound(reqPath, res);
		return;
	}
	var distPath = "./dist" + reqPath;
	
	fs.stat(distPath, function (err, stats) {
		if (stats) {
			// is it a directory? If so, select home.xml as the directory index
			if (stats.isDirectory()) {
				// console.log("Defaulting to " + distPath + "/home.xml");
				distPath += "/home.xml";
			}
		}
		else {
			distPath += ".xml";
		}
		
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
				on.notFound(distPath, res);
			}
		});
	});
}

exports.processRequest = processRequest;
