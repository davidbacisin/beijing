<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:dbp="http://davidbacisinphotography.com/xslt"
	exclude-result-prefixes="dbp">
	
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

<xsl:template match="apos">
	<xsl:text>&#x2019;</xsl:text>
</xsl:template>

<xsl:template match="ndash">
	<xsl:text>&#x2013;</xsl:text>
</xsl:template>

<xsl:template match="mdash">
	<xsl:text>&#x200a;&#x2014;&#x200a;</xsl:text>
</xsl:template>

<xsl:template match="eacute">
	<xsl:text>&#xe9;</xsl:text>
</xsl:template>

<xsl:template match="ellipsis">
	<xsl:text>&#x2026;</xsl:text>
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

<xsl:template match="nav-main">
	<nav id="nav-main">
		<a href="/" title="Home"><label for="nav-menu-toggle"><img id="logoHeader" src="/assets/images/davidbacisin.min.svg" alt="David Bacisin" /></label></a>
		<input id="nav-menu-toggle" type="checkbox" />
		<ul id="nav-menu">
			<xsl:attribute name="class">
				<xsl:choose>
					<xsl:when test="@collapsed = 'false'">
						<xsl:text></xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>collapsed</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<li><a href="/#about">About</a></li>
			<li><a href="/work">Work</a></li>
			<li><a href="/blog">Blog</a></li>
		</ul>
	</nav>
</xsl:template>

<xsl:template match="article-main">
	<main class="article-main" property="articleBody">
		<xsl:apply-templates select="article-header" />
		<xsl:apply-templates select="child::node()[not(local-name()='article-header' or local-name()='footnotes' or local-name()='article-footer')]" />
		<xsl:call-template name="share" />
		<xsl:apply-templates select="footnotes" />
		<xsl:apply-templates select="article-footer" />
	</main>
</xsl:template>

<xsl:template match="article-header">
	<header class="article-header">
		<xsl:if test="img">
			<div class="article-image-container">
				<img class="article-image" property="image" width="100%">
					<xsl:attribute name="src"><xsl:value-of select="img/@src" /></xsl:attribute>
				</img>
			</div>
		</xsl:if>
		<h1 property="headline" class="headline"><xsl:apply-templates select="headline/node()" /></h1>
		<h2 class="byline">
			<xsl:text>by </xsl:text>
			<span property="author"><xsl:apply-templates select="byline/node()" /></span>
			<xsl:text>, published </xsl:text>
			<time property="datePublished"><xsl:value-of select="date[1]" /></time>
			<xsl:if test="count(date) > 1">
        <xsl:text>, last updated </xsl:text>
        <time property="dateModified"><xsl:value-of select="date[last()]" /></time>
			</xsl:if>
		</h2>
		
		<p class="description" property="description">
			<xsl:apply-templates select="desc/node()" />
		</p>
	</header>
</xsl:template>

<xsl:template match="article-footer">
	<footer class="article-footer">
		<xsl:apply-templates select="@*|node()" />
		
		<ul id="nav-footer">
			<li><a href="/#about">About</a></li>
			<li><a href="/work">Work</a></li>
			<li><a href="/blog">Blog</a></li>
		</ul>
		<xsl:call-template name="copyright-notice" />
	</footer>
</xsl:template>

<xsl:template match="footnote">
	<sup class="footnote"><a>
		<xsl:attribute name="href"><xsl:value-of select="@href" /></xsl:attribute>
		<!--<xsl:number level="any" count="footnote" />-->
		<xsl:variable name="searchid"><xsl:value-of select="substring(@href,2)" /></xsl:variable>
		<xsl:value-of select="1+count(//footnotes/li[@id=$searchid]/preceding-sibling::*)" />
	</a></sup>
</xsl:template>

<xsl:template match="footnotes">
	<ol id="footnotes">
		<!--<xsl:for-each select="//footnote">
			<xsl:variable name="searchid"><xsl:value-of select="@href" /></xsl:variable>
			<xsl:copy-of select="//footnotes/li[@id=substring($searchid,2)]" />
		</xsl:for-each>-->
		<xsl:apply-templates select="li" />
	</ol>
</xsl:template>

<xsl:template match="work-item">
  <div class="work-item">
    <a href="{@href}">
      <img class="work-block" src="/assets/images/{@image}" />
    </a>
    <div class="work-block">
      <h2><a href="{@href}"><xsl:value-of select="@name" /></a></h2>
      <p><xsl:apply-templates select="./node()" /></p>
      <p><a href="{@href}"><em>Read more &#8594;</em></a></p>
    </div>
  </div>
</xsl:template>

<!-- photography site navigation and header -->
<xsl:include href="dbp.xsl" />

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
<xsl:template match="html">
<html vocab="http://schema.org/"
	xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
	<!-- typeof attribute on root html element -->
	<xsl:choose>
		<xsl:when test="string-length(@typeof)">
			<xsl:attribute name="typeof"><xsl:value-of select="@typeof" /></xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="typeof">WebPage</xsl:attribute>
		</xsl:otherwise>
	</xsl:choose>
	<!-- role attribute on root html element -->
	<xsl:choose>
		<xsl:when test="string-length(@role)">
			<xsl:attribute name="role"><xsl:value-of select="@role" /></xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="role">Document</xsl:attribute>
		</xsl:otherwise>
	</xsl:choose>
	<!-- class attribute on root html element -->
	<xsl:if test="string-length(@class)">
		<xsl:attribute name="class"><xsl:value-of select="@class" /></xsl:attribute>
	</xsl:if>
	<!-- html head -->
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
		<!-- page title-->
		<title><xsl:apply-templates select="head/title/node()" /></title>
		<!-- page description -->
		<meta name="description" content="{head/meta[@name='description']/@content}" />
		<!-- robots meta tag(s) -->
		<meta name="robots" content="noodp" />
		<xsl:copy-of select="head/meta[@name='robots']" />
		<!-- set the viewport for various screen sizes -->
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!-- OpenGraph meta data -->
		<meta name="og:title" content="{head/title}" />
		<link rel="canonical" href="{$url}" />
		<meta name="og:type" content="website" />
		<xsl:copy-of select="head/meta[starts-with(@name,'og:') or starts-with(@name,'twitter:') and not(@name='og:title' or @name='og:type' or @name='og:url' or @name='og:description')]" />
		<xsl:choose>
			<xsl:when test="head/meta[@name='og:url']">
				<meta name="og:url" content="{head/meta[@name='og:url']/@content}" />
			</xsl:when>
			<xsl:otherwise>
				<meta name="og:url" content="{$url}" />
			</xsl:otherwise>
		</xsl:choose>
		<meta name="og:description" content="{head/meta[@name='description']/@content}" />
		<meta name="fb:admins" content="100004352949080" />
		<!-- Twitter cards -->
		<xsl:if test="not(head/meta[@name='og:image' or @name='twitter:image']) and //article-header/img">
			<meta name="twitter:card">
				<xsl:attribute name="content">
					<xsl:choose>
						<xsl:when test="head/meta[@name='twitter:card']"><xsl:value-of select="head/meta[@name='twitter:card']" /></xsl:when>
						<xsl:otherwise>summary_large_image</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
			</meta>
			<meta name="og:image">
				<xsl:attribute name="content">
					<xsl:text>http://</xsl:text><xsl:value-of select="$siteDomain" /><xsl:value-of select="//article-header/img/@src" />
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
		<!-- common stylesheet, followed by stylesheets added in the head -->
		<link rel="stylesheet" type="text/css" href="/assets/css/main.css" />
		<xsl:copy-of select="head/link[@rel='stylesheet']" />
		<!-- publisher -->
		<link rel="publisher" href="//plus.google.com/106137059548724435394/" />
		<!-- author -->
		
		<!-- scripts -->
		<!-- main.min.js currently does not contain anything -->
		<!--<script src="/assets/js/main.min.js"></script>-->
		<xsl:copy-of select="head/script" />
	</head>
	<!-- html body -->
	<body>
		<!-- copy body attributes -->
		<xsl:copy-of select="body/@*" />
		
		<!-- process all body content -->
		<xsl:apply-templates select="body/node()" />
		
		<xsl:processing-instruction name="server">googleAnalytics</xsl:processing-instruction>
	</body>
	<!-- end html body -->
</html>
</xsl:template>

</xsl:stylesheet>
