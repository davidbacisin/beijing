var express = require('express'),
	compression = require('compression'),
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
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 4765;
        self.isLocal   = (self.ipaddress == "127.0.0.1");
		
		// Set up exit code
		process.on('exit', self.onExit);
		
		// Set up express server
		self.app = express();
		self.app.disable('x-powered-by');
		
		// enable compression
		self.app.use(compression());
		
		// enable parsing of cookies 
		self.app.use(cookieParser());
				
		if (!self.isLocal) {
			// we're behind a load balancer on production
			self.app.set('trust proxy', true);
			
			// track requests
			self.app.use(analytics.middleware("UA-60957549-3"));
		}
		
		// request processing
		self.app.get('/assets/:type/:name', on.asset);
		self.app.get('/', (req, res) => {
			on.page('/1', req, res);
		});
		self.app.get('/page/:pageId', function (req, res) {
			var pageId = parseInt(req.params.pageId);
			if (pageId >= 1 && pageId <= 9) {
				on.page("/" + pageId.toString(), req, res);
			}
			else {
				on.notFound(req.path, res);
			}
		});
		self.app.get('/favicon.ico', on.favicon);
		
		// simple status page for HAProxy pings
		self.app.get('/status', (req, res) => {
			res.send('Alive');
		});
		
		// 404 handler
		self.app.use((req, res, next) => {
			res.status(404).send('Not found. Try the <a href="/">home page</a>.');
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
