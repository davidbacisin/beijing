var fs = require('fs'),
	blog = require('./blog');

/*
transform BlogPostCache into an XML sitemap
*/
function blogPostToXml(post) {
	var data = "<url>";
	data += "<loc>http://www.davidbacisin.com" + post.url + "</loc>";
	data += "<lastmod>" + (new Date(post.datePublished)).toISOString().substr(0,10) + "</lastmod>";
	data += "</url>";
	return data;
}

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

exports.buildBlogSitemap = () => blog.load(buildBlogSitemap);
exports.build = exports.buildBlogSitemap;
