<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:t="http://www.davidbacisin.com/"
	exclude-result-prefixes="t">

<xsl:include href="core.xsl" />

<xsl:template match="t:nav">
	<nav id="navMain">
		<input type="checkbox" class="nav-toggle" />
		<ul id="navMenu" class="collapsed">
		<xsl:for-each select="//h2">
			<li><a href="#"><xsl:value-of select="./text()" /></a></li>
		</xsl:for-each>
		</ul>
	</nav>
</xsl:template>

<xsl:template match="t:svg">
	<xsl:copy-of select="document(concat('../src/assets/images/', @name))" />
</xsl:template>

<xsl:template match="t:image-gallery">
	<ul class="gallery" id="{@id}">
		<xsl:for-each select="t:image">
			<li>
				<span class="caption"><xsl:apply-templates select="./node()" /></span>
				<xsl:text> </xsl:text>
				<a class="image-link" target="_blank" href="/assets/images/{@src}">View image</a>
			</li>
		</xsl:for-each>
	</ul>
	
	<!-- 
	Ultimately, javascript should construct a gallery like this:
	
	<figure class="image-fig" id="{@id}-fig">
		<img src="/assets/images/{@src-res}" />
		<figcaption>
			Image caption...
		</figcaption>
	</figure>
	
	<ul class="gallery" id="{@id}">
		<li>
			<span class="caption">...</span>
			<a class="image-link">
				<img src="/assets/images/{@src-thumb}" />
			</a>
		</li>
	</ul>

	-->
</xsl:template>

<xsl:template match="t:image">
	<figure class="image-fig">
		<div class="image-container"></div>
		<xsl:if test="text() != ''">
			<figcaption><xsl:apply-templates select="./node()" /></figcaption>
		</xsl:if>
		<a class="image-link" target="_blank" href="/assets/images/{@src}">View image</a>
	</figure>
</xsl:template>

<xsl:template match="html">
	<xsl:call-template name="MainPage">
		<xsl:with-param name="html" select="." />
	</xsl:call-template>
</xsl:template>

</xsl:stylesheet>
