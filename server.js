var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	fs = require('fs'),
	on = require('./server-events'),
	RegexMap = require('./lib/RegexMap');
	
var MainServer = function() {
	var self = this;
	
	self.isInitialized = false;
	
	// server configuration
	self.config = {};
	self.configPath = 'server.json';
	
	self.loadConfiguration = function(filename) {
		fs.readFile(filename, function (err, data) {
			if (err) {
				on.error("Could not read configuration file");
			}
			else {
				try {
					onConfigurationChange(JSON.parse(data));
				}
				catch (e){
					on.error("Could not parse JSON data", e);
				}
			}
		});
		
		function onConfigurationChange(configData) {
			// convert select entries into Maps and RegexMaps
			self.config.urlscripts = new RegexMap(configData.urlscripts);
			self.config.redirects = new Map();
			for (var domain of Object.keys(configData.redirects)) {
				self.config.redirects.set(domain, new RegexMap(configData.redirects[domain]));
			}
		}
	};

	self.onExit = function() {

	};
	
	self.initialize = function() {
		if (self.isInitialized) return;
		//  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3280;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
		
		// Set up exit code
		process.on('exit', self.onExit);
		
		// Handle signals. Removed 'SIGPIPE' from the list - bug 852598.
        /*['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.onSignal(element); });
        });*/
		
		// Set up express server
		self.app = express();
		self.app.disable('x-powered-by');
		
		// watch the configuration file
		fs.watch(self.configPath, function (event, filename) {
			switch (event) {
				case "rename":
					this.close();
					break;
				case "change":
					self.loadConfiguration(filename);
					break;
			}
		});

		// load the server configuration
		self.loadConfiguration(self.configPath);
		
		// enable parsing of cookies 
		self.app.use(cookieParser());
		
		// allow parsing of POST requests
		self.app.use(bodyParser.urlencoded({ extended: false }));

		// request processing
		self.app.all(/.*/, function (req, res) {
			// check for redirects on that server
			if (self.config.redirects.has(req.hostname) &&
				(dest = self.config.redirects.get(req.hostname).find(req.path))){
				res.redirect(dest);
			}
			else if (script = self.config.urlscripts.find(req.path)){
				// console.log("Processing <%s> via <%s>", req.path, script);
				try {
					mod = require(script);
					mod.processRequest(req, res);
				}
				catch (e) {
					if (e.code == e.MODULE_NOT_FOUND) {
						on.error("Could not load module", e, res);
					}
					else {
						on.error("Could not process request", e, res);
					}
				}
			}
			else {
				// otherwise we don't know what to do!
				on.notFound(req.path, res);
			}
		});

		self.isInitialized = true;
	};
	
	self.start = function() {
		// listen for requests
		self.app.listen(self.port, self.ipaddress, function() {
			console.log("Listening on %s:%d", self.ipaddress, self.port);
		});
	};
}

// Create the server and run.
var mainServer = new MainServer();
mainServer.initialize();
mainServer.start();
