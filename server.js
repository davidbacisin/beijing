var express = require('express'),
	compression = require('compression'),
	//bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	fs = require('fs'),
	on = require('./server-events'),
	analytics = require("./lib/analytics"),
	RegexMap = require('./lib/RegexMap');
	
var MainServer = function() {
	var self = this;
	
	self.isInitialized = false;

	self.onExit = function() {

	};
	
	self.initialize = function() {
		if (self.isInitialized) return;
		//  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 4765;

        if (typeof self.ipaddress === "undefined") {
            //  Show warning but continue with 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
		
		// Set up exit code
		process.on('exit', self.onExit);
		
		// Set up express server
		self.app = express();
		self.app.disable('x-powered-by');
		
		// enable compression
		self.app.use(compression());
		
		// enable parsing of cookies 
		self.app.use(cookieParser());
		
		// allow parsing of POST requests
		//self.app.use(bodyParser.urlencoded({ extended: false }));
		
		// track request
		self.app.use(analytics.middleware("UA-60957549-3"));
		
		// request processing
		self.app.get('/assets/:type/:name', on.asset);
		self.app.get('/', (req, res) => {
			on.page('/1', req, res);
		});
		self.app.get('/page/:pageId', function (req, res) {
			var pageId = parseInt(req.params.pageId);
			if (pageId >= 1 && pageId <= 3) {
				on.page("/" + pageId.toString(), req, res);
			}
			else {
				on.notFound(req.path, res);
			}
		});
		self.app.get('/sitemap.xml', on.sitemap);
		self.app.get('/robots.txt', on.robots);
		//self.app.get('/google[0-9a-f]+.html', on.googleSiteAuth);
		
		// simple status page for HAProxy pings
		self.app.get('/status', (req, res) => {
			res.send('Alive');
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

/* TODO
 * caching
 * redirects
 */
