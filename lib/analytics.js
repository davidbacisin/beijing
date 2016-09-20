"use strict";

/*
 * User-Agent: <browser UA string>
 * POST https://www.google-analytics.com/collect
 * 
 * set server side
 * ---------------
 * v=1 static
 * tid=UA-XXXXX-1 static
 * cid=<cookie value> from cookie
 * t=<hit type> from URL
 * dl=<page URL, including protocol and hostname> from connection
 * dt=<document title> from data sent
 * ds=server (the data source) static
 * qt=<queue time, amount of time in ms that hit has been waiting on the queue to be sent to the server> calculated on server
 * uip=<User IP address> from connection
 * dr=<referrer URL> from Referrer header
 * de=<document encoding> from Accept-Language header?
 * ua=<user agent override> from User-Agent header
 * 
 * ec=<event category>
 * ea=<event action>
 * el=<event label>
 * ev=<event value>
 * 
 * set client side
 * ---------------
 * sr=<screen resolution>
 * vp=<viewport size of browser>
 * ul=<user language>
 * 
dl:http://www.davidbacisin.com/blog
ul:en-us
de:UTF-8
dt:David Bacisin’s Blog
sd:24-bit
sr:1366x768
vp:1351x155
 */
 
var request = require("request");
var uuid = require("./uuid");
var config = require("./analytics-config");
var url = require("url");
var querystring = require("querystring");

var Visitor = module.exports.Visitor = function (tid, cid, options, context, persistentParams) {
	if (typeof tid === 'object') {
		options = tid;
		tid = cid = null;
	} else if (typeof cid === 'object') {
		options = cid;
		cid = null;
	}

	this._queue = [];

	this.options = options || {};

	if(this.options.hostname) {
		config.hostname = this.options.hostname;
	}
	if(this.options.path) {
		config.path = this.options.path;
	}

	this.requestOptions = this.options.requestOptions || {};

	if (this.options.https) {
		var parsedHostname = url.parse(config.hostname);
		config.hostname = 'https://' + parsedHostname.host;
	}

	if(this.options.enableBatching !== undefined) {
		config.batching = options.enableBatching;
	}

	if(this.options.batchSize) {
		config.batchSize = this.options.batchSize;
	}

	this._context = context || {};
	this._persistentParams = persistentParams || {};

	this.tid = tid || this.options.tid;
	this.cid = this._determineCid(cid, this.options.cid, (this.options.strictCidFormat !== false));
	if(this.options.uid) {
		this.uid = this.options.uid;
	}
}

module.exports.middleware = function (tid, options) {
	this.tid = tid;
	this.options = options;

	return function (req, res, next) {
		req.visitor = Visitor.createFromCookie(req, res);
		
		// track the request
		var params = {
			ds: "server",
			uip: req.ip,
			dr: req.get("Referrer"),
			ua: req.get("User-Agent")
		};
		
		if (req.originalUrl.indexOf("/assets") == 0) {
			// only track asset requests if they are images
			if (req.originalUrl.indexOf("/assets/images") == 0) {
				req.visitor.event("image", "load", req.originalUrl.replace("/assets/images/", ""), 1, params).send();
			}
		}
		else {
			// send a pageview
			req.visitor.pageview(req.originalUrl, "http://" + req.hostname, null, params).send();
		}

		next();
	}
}

Visitor.createFromCookie = function (req, res) {
	var cookies = req.cookies || {};
	var userId = cookies.u;
	if (!uuid.isValid(userId)) {
		userId = uuid.v4();
		// now set the user id cookie for the future
		res.cookie("u", userId, {
			maxAge: 31536000000, // 1 year
			httpOnly: true
		});
	}
	
	return new Visitor(this.tid, userId, this.options);
}

Visitor.prototype = {
	debug: function (debug) {
		this.options.debug = arguments.length === 0 ? true : debug;
		this._log("Logging enabled")
		return this;
	},

	reset: function () {
		this._context = null;
		return this;
	},

	set: function (key, value) {
		this._persistentParams = this._persistentParams || {};
		this._persistentParams[key] = value;
	},

	pageview: function (path, hostname, title, params, fn) {
		if (typeof path === 'object' && path != null) {
			params = path;
			if (typeof hostname === 'function') {
				fn = hostname
			}
			path = hostname = title  = null;
		} else if (typeof hostname === 'function') {
			fn = hostname
			hostname = title = null;
		} else if (typeof title === 'function') {
			fn = title;
			title = null;
		} else if (typeof params === 'function') {
			fn = params;
			params = null;
		}

		params = Object.assign({}, this._persistentParams || {}, params);

		params.dp = path || params.dp || this._context.dp;
		params.dh = hostname || params.dh || this._context.dh;
		params.dt = title || params.dt || this._context.dt;

		this._tidyParameters(params);

		if (!params.dp && !params.dl) {
			return this._handleError("Please provide either a page path (dp) or a document location (dl)", fn);
		}

		return this._withContext(params)._enqueue("pageview", params, fn);
	},

	event: function (category, action, label, value, params, fn) {
		if (typeof category === 'object' && category != null) {
			params = category;
			if (typeof action === 'function') {
				fn = action
			}
			category = action = label = value = null;
		} else if (typeof label === 'function') {
			fn = label;
			label = value = null;
		} else if (typeof value === 'function') {
			fn = value;
			value = null;
		} else if (typeof params === 'function') {
			fn = params;
			params = null;
		}

		params = Object.assign({}, this._persistentParams || {}, params);

		params.ec = category || params.ec || this._context.ec;
		params.ea = action || params.ea || this._context.ea;
		params.el = label || params.el || this._context.el;
		params.ev = value || params.ev || this._context.ev;
		params.p = params.p || params.dp || this._context.p || this._context.dp;

		delete params.dp;
		this._tidyParameters(params);

		params = this._translateParams(params);
		if (!params.ec || !params.ea) {
			return this._handleError("Please provide at least an event category (ec) and an event action (ea)", fn);
		}

		return this._withContext(params)._enqueue("event", params, fn);
	},

	exception: function (description, fatal, params, fn) {
		if (typeof description === 'object') {
			params = description;
			if (typeof fatal === 'function') {
				fn = fatal;
			}
			description = fatal = null;
		} else if (typeof fatal === 'function') {
			fn = fatal;
			fatal = 0;
		} else if (typeof params === 'function') {
			fn = params;
			params = null;
		}

		params = Object.assign({}, this._persistentParams || {}, params);

		params.exd = description || params.exd || this._context.exd;
		params.exf = +!!(fatal || params.exf || this._context.exf);

		if (params.exf === 0) {
			delete params.exf;
		}

		this._tidyParameters(params);

		return this._withContext(params)._enqueue("exception", params, fn);
	},

	send: function (fn) {
		var self = this;
		var count = 1;
		var fn = fn || function () {};
		self._log("Sending " + self._queue.length + " tracking call(s)");

		var test = function () {
			return self._queue.length > 0;
		}

		var getBody = function(params) {
			return params.map(function(x) { return querystring.stringify(x); }).join("\n");
		}

		var iterator = function (fn) {
			var params = [];

			if (config.batching) {
				params = self._queue.splice(0, Math.min(self._queue.length, config.batchSize));
			} else {
				params.push(self._queue.shift());
			}

			var useBatchPath = params.length > 1;

			var path = config.hostname + (useBatchPath ? config.batchPath :config.path);
			self._log(count++ + ": " + JSON.stringify(params));
			var options = {
				body: getBody(params),
				headers: self.options.headers || {}
			};

			request.post(path, options, fn);
		}
		
		// process the queue
		var callback = (err) => {
			self._log("Finished sending tracking calls")
			fn.call(self, err || null, count - 1);
		};
		var looper = (err) => {
			if (err) {
				callback(err);
			}
			else if (test()) {
				iterator(looper);
			}
			else {
				callback(null);
			}
		};
		looper();
	},

	_enqueue: function (type, params, fn) {
		if (typeof params === 'function') {
			fn = params;
			params = {};
		}

		params = this._translateParams(params) || {};

		Object.assign(params, {
			v: config.protocolVersion,
			tid: this.tid,
			cid: this.cid,
			t: type
		});
		
		if(this.uid) {
			params.uid = this.uid;
		}

		this._queue.push(params);

		if (this.options.debug) {
			this._checkParameters(params);
		}

		this._log("Enqueued " + type + " (" + JSON.stringify(params) + ")");

		if (fn) {
			this.send(fn);
		}

		return this;
	},

	_handleError: function (message, fn) {
			this._log("Error: " + message)
			fn && fn.call(this, new Error(message))
			return this;
	},

	_determineCid: function () {
		var args = Array.prototype.splice.call(arguments, 0);
		var id;
		var lastItem = args.length-1;
		var strict = args[lastItem];
		if (strict) {
			for (var i = 0; i < lastItem; i++) {
				if (uuid.isValid(args[i])) return args[i];
			}
		} else {
			for (var i = 0; i < lastItem; i++) {
				if (args[i]) return args[i];
			}
		}
		return uuid.v4();
	},

	_checkParameters: function (params) {
		for (var param in params) {
			if (config.acceptedParameters.indexOf(param) !== -1 || config.acceptedParametersRegex.filter(function (r) {
					return r.test(param);
				}).length) {
				continue;
			}
			this._log("Warning! Unsupported tracking parameter " + param + " (" + params[param] + ")");
		}
	},

	_translateParams: function (params) {
        var translated = {};
        for (var key in params) {
            if (config.parametersMap.hasOwnProperty(key)) {
                translated[config.parametersMap[key]] = params[key];
            } else {
                translated[key] = params[key];
            }
        }
        return translated;
    },

	_tidyParameters: function (params) {
		for (var param in params) {
			if (params[param] === null || params[param] === undefined) {
				delete params[param];
			}
		}
		return params;
	},

	_log: function (message) {
		this.options.debug && console.log("[universal-analytics] " + message);
	},

	_withContext: function (context) {
		var visitor = new Visitor(this.tid, this.cid, this.options, context, this._persistentParams);
		visitor._queue = this._queue;
		return visitor;
	}
}
