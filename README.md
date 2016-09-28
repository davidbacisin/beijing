# Beijing by David Bacisin

Take a journey to Beijing. David Bacisin tells of his three weeks in the
capital of the People's Republic of China, complete with illustrations
and photographs.

## Technical highlights
* This site was designed and programmed to meet the requirements of the 10K Apart Contest
* developer.js acts as a static site generator which:
 * uses XSLT to transform page content into fully-fledged, mostly-minified HTML pages
 * runs Sass to produce minified CSS
 * uses UglifyJS to minify Javascript
 * Automatically resizes images with jimp and optimizes them with jpegoptim
* Site works well without CSS or JS (just try it out in Lynx!)
* Server-side Google Analytics allows tracking without downloading extra bytes to the client
* Pure CSS and checkbox-based menu enables toggling site menu visibility even with Javascript disabled
* Images:
 * wrapped in `figure`s with `figcaption`s, meeting accessibility requirements for images (http://lists.w3.org/Archives/Public/public-html/2011Apr/0451.html)
 * Without Javascript, images will appear as captions followed by links to the image
 * Lazy-loaded by Javascript, at a resolution appropriate for the device
 * Clicking an image opens the high resolution version
* Other elements are appropriately annotated for assistive technologies
