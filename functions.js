var on = require('./server-events');
	
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
