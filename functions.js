var on = require('./server-events'),
	sql = require('mysql'),
	blog = require('./lib/blog');
var dbPool = sql.createPool({
		connectionLimit: 50,
		host: process.env.OPENSHIFT_MYSQL_DB_HOST,
		port: process.env.OPENSHIFT_MYSQL_DB_PORT,
		user: 'user4Twe9',
		password: 'bV32xXsa67mzD0',
		database: (process.env.OPENSHIFT_MYSQL_DB_HOST? 'nodejs': 'design')
		//database: 'design'
	});
	
function escapeHtml(text){
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

module.exports = {
	insertArticleList: function() {
		var ret = "<ul class='article-list'>";
		blog.getPosts().forEach(function (bp){
			ret += "<li><a href='";
			ret += bp.url;
			ret += "'>";
			ret += bp.title;
			ret += "</a><time>";
			ret += bp.date;
			ret += "</time></li>";
		});
		ret += "</ul>";
		return ret;
	},
	processPortfolioInquiry: function(req, res) {
		var email = req.param('e');
		if (email && 
			email.length > 0 &&
			email.length <= 128 && 
			email.indexOf('@') >= 0) { // check that there is at least an @ sign
			dbPool.getConnection(function (err, connection) {
				if (err) {
					on.error("Could not establish a connection with the database: " + err);
				}
				else {
					var option = connection.escape(req.param('o')=="occasional"? 2: 1);
					var stmt = "INSERT INTO `portfolio_inquiries` (`email`, `option`) VALUES (" + connection.escape(email) + 
							   ", '" + option +
							   "') ON DUPLICATE KEY UPDATE `option`='" + option + "'";
					connection.query(stmt, function (err, result) {
						if (err) {
							console.log("SQL Error: %s", err);
						}
					});
					// release the connection back to the pool
					connection.release();
				}
			});
		}
		else {
			// just pretend like we've received it.
			console.log("No param: %s", email);
		}
		return '';
	},
	dbpContactForm: function(req, res) {
		var sent = false,
			ret = "",
			sendTo = "support";
		if (req.body.hasOwnProperty('btnSend')) {
			var isValidEmail = (req.body['email'].search(/^.+?@.*?\.[a-z]+$/i)==0);
			if (isValidEmail){
				var nameCleaned = req.body['name'].replace(/[^-a-zA-Z .]/g, '_');
				var subjectCleaned = req.body['subject'].replace(/[^-a-zA-Z0-9 .:;?!$]/g, '_');
				var messageCleaned = escapeHtml(req.body['message']);
				
			}
			else {
				
			}
		}
		// if POST btnSend
		if (!sent) {
			ret += "<form method='post' action='/contact'>"
				+ "<p><label for='name'>Name:</label><input type='text' name='name' id='name' /></p>"
				+ "<p><label for='email'>Email:</label><input type='email' name='email' id='email' /></p>"
				+ "<p><label for='subject'>Subject:</label><input type='text' name='subject' id='subject' value='' /></p>"
				+ "<p><textarea name='message' resizable='no'></textarea></p>"
				+ "<p><input type='hidden' name='sendTo' value='support' />"
				+ "<button type='submit' name='btnSend' value='send'>Submit</button></p>"
				+ "</form>";
		}
		else {
			ret += "<p>Your message has been sent. I will email you a response as soon as I am able.</p>";
		}
		return ret;
	},
	googleAnalytics: function(req, res) {
		if (typeof process.env.OPENSHIFT_NODEJS_IP === "undefined") {
			// then we're on development. don't insert tracking data
			return "<!-- google analytics -->";
		}
		else {
			return "<script>\
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');\
			ga('create', 'UA-60957549-1', 'auto');\
			ga('send', 'pageview');\
			</script>";
		}
	}
};

// watch and load the blog posts
blog.watch();
blog.load();

