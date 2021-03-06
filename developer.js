#!/usr/bin/env node
"use strict";

var fs = require('fs'),
	path = require('path'),
	program = require('commander'),
	chokidar = require('chokidar'),
	spawn = require('child_process').spawn,
	RegexMap = require('./lib/RegexMap');
	
program.version('0.1.0')
	.option('-v, --verbose', 'Verbose output')
	.option('--skip-images', 'Skip image optimization')
	.parse(process.argv);

// initialize
program.xsltLastModified = 0;
program.mainWatcher = null;
program.templateWatcher = null;
program.processors = new Map();
program.started = false;

program.toSrcPath = p => {
	if (p.startsWith(program.src))
		return p;
	else if (p.startsWith(program.dst))
		p = p.replace(program.dst, "");
	return path.join(program.src, p);
}
program.toDstPath = p => {
	if (p.startsWith(program.dst))
		return p;
	else if (p.startsWith(program.src))
		p = p.replace(program.src, "");
	return path.join(program.dst, p);
}

class DefaultProcessor {
	process(event, p) {
		switch(event) {
			case "add":
			case "change":
				DefaultProcessor.copyFile(p);
				break;
			case "unlink":
				console.log("Not implemented: default processor unlink");
				break;
		}
	}
	
	static copyFile(path) {
		var srcPath = program.toSrcPath(path),
			distPath = program.toDstPath(path);
		var readStream = fs.createReadStream(srcPath);
		readStream.on("error", function(err) {
			console.log("Failed to read for copying: " + srcPath);
		});
		var writeStream = fs.createWriteStream(distPath);
		writeStream.on("error", function(err) {
			console.log("Failed to write when copying: " + srcPath);
		});
		writeStream.on("close", function() {
			if (program.verbose)
				console.log("Copied " + srcPath + " to " + distPath);
		});
		readStream.pipe(writeStream);
	}
}
class XmlProcessor {
	constructor() {
		if (!XmlProcessor._canonicalUrlRegex) {
			// create the canonical url regex based on the given source and destination directories
			XmlProcessor._canonicalUrlRegex = new RegExp(program.src + "|" + program.dst + "|(\/home)?\.xml", "g");
		}
	}
	
	process(event, p) {
		var srcPath = program.toSrcPath(p),
			dstPath = program.toDstPath(p);
		switch(event) {
			case "add":
			case "change":
				XmlProcessor.transformXml(srcPath, (code, data) => {
					if (code === 0){
						fs.writeFile(dstPath, data);
						console.log("Updated " + dstPath);
					}
					else {
						console.warn("XSLTPROC Code " + code + ". Could not transform XML: " + dstPath);
					}
				});
				break;
			case "unlink":
				// remove the file from the destination
				fs.unlink(dstPath, err => {
					if (err) {
						console.warn("Error while removing file <" + dstPath + ">: " + err.toString());
					}
					else {
						console.log("Removed file to match source: " + dstPath);
					}
				});
				break;
		}
	}
	
	static transformXml(filename, callback) {
		var canonicalUrl = filename.replace(XmlProcessor._canonicalUrlRegex, "");
			canonicalUrl = canonicalUrl.replace(/\\/g, "/"); // replace backslashes with forward slashes on Windows
		var xslTemplateName = program.templates.find(canonicalUrl);
		var xsltproc = spawn("xsltproc", [
				"--stringparam", "path", canonicalUrl,
				"templates/" + xslTemplateName + ".xsl",
				filename
			]);
		var data = "";
		xsltproc.stdout.on("data", chunk => { data += chunk.toString() });
		xsltproc.stderr.on("data", chunk => { console.warn(chunk.toString()) });
		// close means we have all the output
		xsltproc.on("close", code => {
			if (code!=0 || program.verbose)
				console.log("xsltproc closed with code: " + code);
			// do some replacements for better compatibility with HTML
			data = data.replace(/<\?xml.*?\?>/, ''); // remove xml declaration
			data = data.replace(/\sxmlns=(''|\"\")/, ''); // remove empty root namespace (why does xsltproc output this?)
			data = data.replace(/<([^\s<>]+)(\s+[^<>]*?\s*)?\/>/gm, (match, tagName, tagAttributes) => {
					if (!tagAttributes) tagAttributes = '';
					switch(tagName) {
						// the following list of elements can be empty in HTML,
						// and should not have end tags for browser compatibility 
						case 'area':
						case 'base':
						case 'br':
						case 'col':
						case 'hr':
						case 'img':
						case 'input':
						case 'link':
						case 'meta':
						case 'param':
						case 'command':
						case 'keygen':
						case 'source':
							return "<" + tagName + tagAttributes + "/>";
						default:
							return "<" + tagName + tagAttributes + "></" + tagName + ">";
					}
				});
			data = data.replace(/\/>/, ' />');
			callback(code, data);
		});
	}
}
class ScssProcessor {
	constructor() {
		this._timeout = 0;
		this.secondsToWaitBeforeCompile = 10;

		ScssProcessor.postcss = require('postcss');
		ScssProcessor.autoprefixer = require('autoprefixer');
		if (!ScssProcessor._postcss) {
			ScssProcessor._postcss = ScssProcessor.postcss([
				ScssProcessor.autoprefixer({
					browsers: ['>1%'],
					cascade: false
				})
			]);
		}
	}
	
	process(event, p) {
		switch(event) {
			/* SCSS is not compiled on a file-to-file basis: instead, the files 
			 * that start with underscores are included into the main files.
			 * We will compile the whole directory on any file-based event */
			case "add":
			case "change":
			case "unlink":
				/* prevent Sass from running to often, since the whole directory
				will be compiled each time rather than just one file at a time */
				clearTimeout(this._timeout);
				this._timeout = setTimeout(ScssProcessor.runSass, this.secondsToWaitBeforeCompile * 1000);
				break;
		}
	}
	
	static runSass() {
		var cssDir = "/assets/css";
		var sass = spawn("sass", [
				"-t", "compressed",
				"--precision", "3",
				"--cache-location", "tmp/sass-cache",
				"--update", (program.toSrcPath(cssDir) + ":" + program.toDstPath(cssDir))
			]);
		if (program.verbose)
			sass.stdout.on("data", chunk => { console.log(chunk.toString()) });
		sass.stderr.on("data", chunk => { console.warn(chunk.toString()) });
		sass.on("close", code => {
			console.log("Sass closed with code " + code);
			// now run autoprefixer and any other PostCSS plugins
			ScssProcessor.runPostCSS();
		});
	}
	
	static runPostCSS() {
		/* load the css for reading. Use separate fd's for reading and 
		 * writing in case there is an error */
		var csspath = "dist/assets/css/beijing.css",
			fileoptions = { encoding: "utf8" };
		var css = fs.readFileSync(csspath, fileoptions);
		ScssProcessor._postcss.process(css).then(result => {
			result.warnings().forEach(warn => {
				console.warn(warn.toString());
			});
			// now write the css
			fs.writeFile(csspath, result.css, fileoptions, err => console.log("PostCSS complete."));
		});
	}
}
class JsProcessor {
	constructor() {
		JsProcessor.uglifyjs = require("uglify-js");
	}
	
	process(event, p) {
		var srcPath = program.toSrcPath(p),
			// construct the destination path, including the .min in the extension
			dstPath = program.toDstPath(p).replace(/(\.min)?\.js$/, ".min.js");
		switch(event) {
			case "add":
			case "change":
				// minify. All the defaults are fine
				var minified = JsProcessor.uglifyjs.minify(srcPath);
				// write to dist
				fs.writeFile(dstPath, minified.code, err => {
					if (err) {
						console.warn("Error while compiling javascript <" + dstPath + ">: " + err.toString());
					}
					else{
						console.log("Javascript compiled to " + dstPath)
					}
				});
				break;
			case "unlink":
				// remove the file from the destination
				fs.unlink(dstPath, err => {
					if (err) {
						console.warn("Error while removing file <" + dstPath + ">: " + err.toString());
					}
					else {
						console.log("Removed file to match source: " + dstPath);
					}
				});
				break;
		}
	}
}
class JpegProcessor {
	constructor() {
		if (!JpegProcessor._queue) {
			JpegProcessor._queue = [];
		}
		if (!JpegProcessor.sizes) {
			JpegProcessor.sizes = [
				  '',
				1200,
				 600,
				 480,
				 't'
			];
		}
		if (!JpegProcessor.jimp) {
			JpegProcessor.jimp = require("jimp");
		}
	}
	
	process(event, p) {
		var srcPath = program.toSrcPath(p);
		switch(event) {
			case "add":
			case "change":
				JpegProcessor.processJpeg(srcPath, (err, imagePath) => {
					if (err){
						console.warn("[JpegProcessor] Error occured on " + imagePath + ": " + err);
					}
					else {
						console.log("Updated image " + imagePath);
					}
				});
				break;
			case "unlink":
				// remove the file from the destination
				/*fs.unlink(dstPath, err => {
					if (err) {
						console.warn("Error while removing file <" + dstPath + ">: " + err.toString());
					}
					else {
						console.log("Removed file to match source: " + dstPath);
					}
				});*/
				console.warn("Not implemented: response to deleted jpeg");
				break;
		}
	}
	
	static processJpeg(srcPath, callback) {
		// only process one at a time, queuing the other ones
		if (!JpegProcessor._processing) {
			JpegProcessor._processing = true;
			JpegProcessor.jimp.read(srcPath).then(image => {
				// stateful object
				let imageState = {
					writesRemaining: 0,
					srcPath: srcPath,
					dstPaths: []
				};
				// resize and process
				for (let size of JpegProcessor.sizes) {
					JpegProcessor.resizeJpeg(image, imageState, size, callback);
				}
			}).catch((err, image) => {
				callback(err, srcPath);
			});
		}
		else {
			JpegProcessor._queue.push(srcPath);
		}
	}
	
	static resizeJpeg(image, imageState, size, next) {
		let dstPath = program.toDstPath(imageState.srcPath);
		
		let workingImage = image.clone();
		if (size == "t") {
			workingImage = workingImage.cover(110, 110, JpegProcessor.jimp.HORIZONTAL_ALIGN_CENTER | JpegProcessor.jimp.VERTICAL_ALIGN_MIDDLE);
			dstPath = dstPath.replace(".jpg", "-t.jpg");
		}
		else if (size != '') {
			workingImage = workingImage.scaleToFit(size, size, JpegProcessor.jimp.RESIZE_BILINEAR);
			dstPath = dstPath.replace(".jpg", "-" + size + ".jpg");
		}
		
		imageState.writesRemaining++;
		imageState.dstPaths.push(dstPath);
		workingImage.write(dstPath, JpegProcessor.getJimpCallback(imageState, dstPath, next));
	}
	
	static getJimpCallback(imageState, path, next) {
		return (err, image) => {
			imageState.writesRemaining--;
			if (err) {
				next(err, path);
			}
			else if (imageState.writesRemaining <= 0) {
				// then run jpegoptim
				JpegProcessor.runJpegoptim(imageState.dstPaths, next);
				// we're done processing (we don't care that jpegoptim might still be running in the background though)
				JpegProcessor._processing = false;
				// so move on to the next image in the queue
				if (JpegProcessor._queue.length) {
					JpegProcessor.processJpeg(JpegProcessor._queue.shift(), next);
				}
			}
		};
	}
	
	static runJpegoptim(dstPaths, callback) {
		var args = [
				"-T3", // skip files that have already been optimized
				"--all-progressive",
				"-m96" // max quality of 96%
			];
		if (!program.verbose)
			args.push("-q"); // quiet output
		// the image paths are the last arguments
		Array.prototype.push.apply(args, dstPaths);
		
		var jpegoptim = spawn("jpegoptim", args);
		if (program.verbose)
			jpegoptim.stdout.on("data", chunk => { console.log(chunk.toString()) });
		jpegoptim.stderr.on("data", chunk => { console.warn(chunk.toString()) });
		jpegoptim.on("close", code => {
			console.log("jpegoptim closed with code " + code);
			callback(null, dstPaths);
		});
	}
}

program.loadConfiguration = function() {
	// we need the config before we do anything else, so make it sync
	let config = JSON.parse(fs.readFileSync("developer.json"));
	program.src = config.source;
	program.dst = config.destination;
	program.templates = new RegexMap(config.templates);
}

program.start = function() {
	if (program.started) {
		console.log("Already started.");
		return;
	}
	
	program.started = true;
	
	program.loadConfiguration();
	
	// initialize the processors
	program.processors.set("default", new DefaultProcessor());
	program.processors.set("xml", new XmlProcessor());
	program.processors.set("scss", new ScssProcessor());
	program.processors.set("js", new JsProcessor());
	program.processors.set("jpeg", new JpegProcessor());
	
	// watch src directory for changes
	program.mainWatcher = chokidar.watch(program.src, { ignored: /[\/\\]\./ })
		.on("all", (event, path) => {
			program.getProcessor(path).process(event, path);
		});
	
	// TODO: watch the XSLT template for changes
	/*program.templateWatcher = chokidar.watch(program.template)
		.on("change", (filename, fileStats) => {
			program.xsltLastModified = fileStats.mtime;
			var srcStat = fs.statSync(program.src);
			// process all of the xml files
			var xmlp = program.processors.get("xml");
			console.log("Not implemented: response to XSL template change");
		});*/
}

program.getProcessor = function(p) {
	var key = "default";
	if (p.startsWith(path.join(program.src, "assets"))) {
		if (p.startsWith(path.join(program.src, "assets", "css"))) {
			key = "scss";
		}
		else if (p.startsWith(path.join(program.src, "assets", "js")) &&
			path.extname(p) == ".js"){
			key = "js";
		}
		else if (!program.skipImages && 
			p.startsWith(path.join(program.src, "assets", "images")) &&
			path.extname(p) == ".jpg"){
			key = "jpeg";
		}
	}
	else if (path.extname(p) == ".xml") {
		key = "xml";
	}
	return program.processors.get(key);
}

program.stop = function() {
	// close the watchers
	program.mainWatcher.close();
	//program.templateWatcher.close();
	program.started = false;
	console.log("Watch stopped.");
}

// set the cleanup code
process.on('SIGINT', program.stop);

// run
program.start();
