var fs = require('fs');

/*
function buildBlogSitemap(posts) {
	var data = "﻿<?xml version='1.0' encoding='UTF-8'?>\
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>";
	posts.forEach(function (bp) {
		data += blogPostToXml(bp);
	});
	data += "</urlset>";
	// save the data
	fs.writeFile("./dist/blog/sitemap.xml", data, function(err) {
		if (err) throw err;
		else console.log("Blog sitemap updated.");
	});
}
*/

exports.build = () => {};
