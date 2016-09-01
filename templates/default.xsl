<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:dbp="http://davidbacisinphotography.com/xslt"
	exclude-result-prefixes="dbp">

<xsl:include href="core.xsl" />

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

<xsl:template match="html">
	<xsl:call-template name="MainPage">
		<xsl:with-param name="html" select="." />
	</xsl:call-template>
</xsl:template>

</xsl:stylesheet>
