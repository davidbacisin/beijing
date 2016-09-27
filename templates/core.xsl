<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
<xsl:param name="siteDomain">www.davidbacisin.com</xsl:param>
<xsl:param name="path"></xsl:param>
<xsl:param name="url"><xsl:choose>
	<xsl:when test="$url!=''"><xsl:value-of select="$url" /></xsl:when>
	<xsl:otherwise>http://<xsl:value-of select="$siteDomain" /><xsl:value-of select="$path" /></xsl:otherwise>
</xsl:choose></xsl:param>

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

<html vocab="http://schema.org/" lang="en" xmlns:xlink="http://www.w3.org/1999/xlink">
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
			<xsl:attribute name="role">document</xsl:attribute>
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
		<meta name="description" content="Take a journey to Beijing. David Bacisin tells of his three weeks in the capital of the People's Republic of China, complete with illustrations and photographs." />
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
		<link rel="icon" type="image/x-icon" href="/favicon.ico" />
		<!-- stylesheets -->
		<link rel="stylesheet" type="text/css" href="/assets/css/beijing.css" />
		<xsl:copy-of select="$html/head/link[@rel='stylesheet']" />
		<!-- publisher -->
		<link rel="publisher" href="//plus.google.com/106137059548724435394/" />
		<!-- author -->
		
		<!-- scripts -->
		<xsl:copy-of select="$html/head/script" />
	</head>
	<!-- html body -->
	<body>
		<!-- copy body attributes -->
		<xsl:copy-of select="$html/body/@*" />
		
		<script><![CDATA[document.body.className="js";]]></script>
		
		<!-- process all body content -->
		<xsl:apply-templates select="$html/body/node()" />
		
		<footer class="gray" style="text-align:center">© 2016 David Bacisin</footer>
		<script src="/assets/js/gallery.min.js" defer="defer"></script>
	</body>
	<!-- end html body -->
</html>
</xsl:template>

	</xsl:stylesheet>
