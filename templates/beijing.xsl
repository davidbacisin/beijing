﻿<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:t="http://www.davidbacisin.com/"
	exclude-result-prefixes="t">
	

<xsl:variable name="siteDomain">beijing.davidbacisin.com</xsl:variable>
<xsl:param name="path"></xsl:param>
<xsl:param name="url"><xsl:text>http://</xsl:text><xsl:value-of select="$siteDomain" />
<xsl:choose>
	<xsl:when test="$path='/1'"><xsl:text>/</xsl:text></xsl:when>
	<xsl:when test="number(substring($path, 2)) &gt; 1"><xsl:text>/page</xsl:text><xsl:value-of select="$path"/></xsl:when>
	<xsl:otherwise><xsl:value-of select="$path"/></xsl:otherwise>
</xsl:choose>
</xsl:param>

<xsl:include href="core.xsl" />

<xsl:template match="t:nav">
	<nav id="navMain">
		<input type="checkbox" class="nav-toggle" />
		<ul id="navMenu" class="uncollapsed">
		<xsl:for-each select="(document('../src/1.xml') | document('../src/2.xml'))//h2">
			<li><a href="#{translate(translate(./text(),'”“:.',''),' ','-')}"><xsl:value-of select="./text()" /></a></li>
		</xsl:for-each>
		</ul>
	</nav>
</xsl:template>

<!-- make is so we can jump to main headings -->
<xsl:template match="h2">
	<a name="{translate(translate(./text(),'”“:.',''),' ','-')}"></a>
	<h2><xsl:apply-templates select="./node()" /></h2>
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
				<a class="image-link" target="_blank" href="/assets/images/{@src}">
					<xsl:attribute name="class">
						<xsl:text>image-link</xsl:text>
						<xsl:if test="@portrait='portrait'"><xsl:text> p</xsl:text></xsl:if>
					</xsl:attribute>
					<xsl:text>View image</xsl:text>
				</a>
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
		<div>
			<xsl:attribute name="class">
				<xsl:text>image-container</xsl:text>
				<xsl:if test="@portrait='portrait'"><xsl:text> p</xsl:text></xsl:if>
			</xsl:attribute>
		</div>
		<xsl:if test="text() != ''">
			<figcaption><xsl:apply-templates select="./node()" /></figcaption>
		</xsl:if>
		<a class="image-link" target="_blank" href="/assets/images/{@src}">View image</a>
	</figure>
</xsl:template>

<xsl:template match="t:tip">
	<aside>
		<h4>Traveler’s Tip.</h4><xsl:text> </xsl:text>
		<xsl:apply-templates select="./node()" />
	</aside>
</xsl:template>

<xsl:template match="html">
	<xsl:call-template name="MainPage">
		<xsl:with-param name="html" select="." />
	</xsl:call-template>
</xsl:template>

</xsl:stylesheet>
