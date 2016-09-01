"use strict";

var fs = require('fs'),
	path = require('path');
	
exports.walk = (filepath, options) => {
	/* Returns a Map of filenames and their corresponding stat objects */
	var files = new Map(),
		errors = new Map();
	var remaining = [filepath];
		
	return new Promise(function (resolve, reject) {
		function tryResolve() {
			if (remaining.length === 0)
				resolve({
					errors: errors,
					files: files,
					options: options
				});
			else
				walkStat(remaining.pop());
		}
		
		function walkStat(fp) {
			fs.stat(fp, function (err, stats) {
				if (err) {
					errors.set(fp, err);
					tryResolve();
				}
				// if it's a directory, check out the contents
				else if (stats.isDirectory()) {
					fs.readdir(fp, function (err, children) {
						if (err) {
							errors.set(fp, err);
						}
						else {
							files.set(fp, stats);
							for (let child of children) {
								remaining.push(path.join(fp, child));
							}
						}
						tryResolve();
					});
				}
				else {
					files.set(fp, stats);
					tryResolve();
				}
			});
		}
		
		// and go.
		tryResolve();
	});
}
