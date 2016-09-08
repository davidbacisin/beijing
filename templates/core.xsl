<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
<xsl:variable name="siteDomain">www.davidbacisin.com</xsl:variable>
<xsl:param name="path"></xsl:param>
<xsl:param name="url">http://<xsl:value-of select="$siteDomain" /><xsl:value-of select="$path" /></xsl:param>

<!-- Output method must be xml so that processing instructions are generated correctly -->
<xsl:output method="xml" 
	omit-xml-declaration="yes" />

<!-- Deep copy unrecognized (most likely html) elements -->
<xsl:template match="@*|node()">
	<xsl:copy>
		<xsl:apply-templates select="@*|node()" />
	</xsl:copy>
</xsl:template>

<xsl:template match="nbsp">
	<xsl:text>&#xa0;</xsl:text>
</xsl:template>

<xsl:template match="ndash">
	<xsl:text>&#x2013;</xsl:text>
</xsl:template>

<xsl:template match="mdash">
	<xsl:text>&#x200a;&#x2014;&#x200a;</xsl:text>
</xsl:template>

<xsl:template match="email">
	<a href="mailto:david@davidbacisin.com">david@davidbacisin.com</a>
</xsl:template>

<xsl:template match="copyright-notice" name="copyright-notice">
	<xsl:text>&#xa9; 2016 David Bacisin</xsl:text>
</xsl:template>

<xsl:template match="share" name="share">
<div class="si-container">
<a class="si si-facebook" href="https://facebook.com/sharer.php?u={$url}" target="_blank" title="Share on Facebook" aria-label="Share on Facebook"></a>
<a class="si si-google" href="https://plus.google.com/share?url={$url}" target="_blank" title="Share on Google+" aria-label="Share on Google Plus"></a>
<a class="si si-twitter" href="https://twitter.com/intent/tweet?url={$url}&amp;via=DavidBacisin" target="_blank" title="Share on Twitter" aria-label="Share on Twitter"></a>
</div>
</xsl:template>

<!-- for style elements -->
<xsl:template match="style">
	<style>
	<xsl:text disable-output-escaping="yes">/*&lt;![CDATA[*/</xsl:text>
		<xsl:value-of select="."
			disable-output-escaping="yes" />
	<xsl:text disable-output-escaping="yes">/*]]&gt;*/</xsl:text>
	</style>
</xsl:template>

<!-- Main page template -->
<xsl:template name="MainPage">
<!-- The HTML element should be passed as a param -->
<xsl:param name="html" />

<html vocab="http://schema.org/" xml:lang="en">
	<!-- typeof attribute on root html element -->
	<xsl:choose>
		<xsl:when test="string-length($html/@typeof)">
			<xsl:attribute name="typeof"><xsl:value-of select="$html/@typeof" /></xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="typeof">WebPage</xsl:attribute>
		</xsl:otherwise>
	</xsl:choose>
	<!-- role attribute on root html element -->
	<xsl:choose>
		<xsl:when test="string-length($html/@role)">
			<xsl:attribute name="role"><xsl:value-of select="$html/@role" /></xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="role">Document</xsl:attribute>
		</xsl:otherwise>
	</xsl:choose>
	<!-- class attribute on root html element -->
	<xsl:if test="string-length($html/@class)">
		<xsl:attribute name="class"><xsl:value-of select="$html/@class" /></xsl:attribute>
	</xsl:if>
	<!-- html head -->
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
		<!-- page title-->
		<title><xsl:apply-templates select="$html/head/title/node()" /></title>
		<!-- page description -->
		<meta name="description" content="{$html/head/meta[@name='description']/@content}" />
		<!-- robots meta tag(s) -->
		<meta name="robots" content="noodp" />
		<xsl:copy-of select="$html/head/meta[@name='robots']" />
		<!-- set the viewport for various screen sizes -->
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!-- OpenGraph meta data -->
		<meta name="og:title" content="{$html/head/title}" />
		<link rel="canonical" href="{$url}" />
		<meta name="og:type" content="website" />
		<xsl:copy-of select="$html/head/meta[starts-with(@name,'og:') or starts-with(@name,'twitter:') and not(@name='og:title' or @name='og:type' or @name='og:url' or @name='og:description')]" />
		<xsl:choose>
			<xsl:when test="$html/head/meta[@name='og:url']">
				<meta name="og:url" content="{$html/head/meta[@name='og:url']/@content}" />
			</xsl:when>
			<xsl:otherwise>
				<meta name="og:url" content="{$url}" />
			</xsl:otherwise>
		</xsl:choose>
		<meta name="og:description" content="{$html/head/meta[@name='description']/@content}" />
		<meta name="fb:admins" content="100004352949080" />
		<!-- Twitter cards -->
		<xsl:if test="not($html/head/meta[@name='og:image' or @name='twitter:image']) and $html//article-header/img">
			<meta name="twitter:card">
				<xsl:attribute name="content">
					<xsl:choose>
						<xsl:when test="$html/head/meta[@name='twitter:card']"><xsl:value-of select="$html/head/meta[@name='twitter:card']" /></xsl:when>
						<xsl:otherwise>summary_large_image</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
			</meta>
			<meta name="og:image">
				<xsl:attribute name="content">
					<xsl:text>http://</xsl:text><xsl:value-of select="$siteDomain" /><xsl:value-of select="$html//article-header/img/@src" />
				</xsl:attribute>
			</meta>
		</xsl:if>
		<meta name="twitter:site" content="@DavidBacisin" />
		<meta name="twitter:creator" content="@DavidBacisin" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<!-- page icon -->
		<link rel="apple-touch-icon" sizes="57x57" href="/assets/images/apple-touch-icon-57x57.png" />
		<link rel="apple-touch-icon" sizes="114x114" href="/assets/images/apple-touch-icon-114x114.png" />
		<link rel="apple-touch-icon" sizes="72x72" href="/assets/images/apple-touch-icon-72x72.png" />
		<link rel="apple-touch-icon" sizes="144x144" href="/assets/images/apple-touch-icon-144x144.png" />
		<link rel="apple-touch-icon" sizes="60x60" href="/assets/images/apple-touch-icon-60x60.png" />
		<link rel="apple-touch-icon" sizes="120x120" href="/assets/images/apple-touch-icon-120x120.png" />
		<link rel="apple-touch-icon" sizes="76x76" href="/assets/images/apple-touch-icon-76x76.png" />
		<link rel="apple-touch-icon" sizes="152x152" href="/assets/images/apple-touch-icon-152x152.png" />
		<link rel="icon" type="image/png" href="/assets/images/favicon-192x192.png" sizes="192x192" />
		<link rel="icon" type="image/png" href="/assets/images/favicon-160x160.png" sizes="160x160" />
		<link rel="icon" type="image/png" href="/assets/images/favicon-96x96.png" sizes="96x96" />
		<link rel="icon" type="image/png" href="/assets/images/favicon-16x16.png" sizes="16x16" />
		<link rel="icon" type="image/png" href="/assets/images/favicon-32x32.png" sizes="32x32" />
		<meta name="msapplication-TileColor" content="#00a300" />
		<meta name="msapplication-TileImage" content="/assets/images/mstile-144x144.png" />
		<!-- stylesheets -->
		<link rel="stylesheet" type="text/css" href="/assets/css/beijing.css" />
		<xsl:copy-of select="$html/head/link[@rel='stylesheet']" />
		<!-- publisher -->
		<link rel="publisher" href="//plus.google.com/106137059548724435394/" />
		<!-- author -->
		
		<!-- scripts -->
		<!-- main.min.js currently does not contain anything -->
		<!--<script src="/assets/js/main.min.js"></script>-->
		<xsl:copy-of select="$html/head/script" />
	</head>
	<!-- html body -->
	<body>
		<!-- copy body attributes -->
		<xsl:copy-of select="$html/body/@*" />
		
		<!-- process all body content -->
		<xsl:apply-templates select="$html/body/node()" />
	</body>
	<!-- end html body -->
</html>
</xsl:template>

	</xsl:stylesheet>
