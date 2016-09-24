/* image gallery */
(function(d){
	
function hasClass(el, className) {
	var list = el.classList;
	return list && list.contains(className);
}
function addClass(el, className) {
	el.classList.add(className);
}
function removeClass(el, className) {
	el.classList.remove(className);
}
function nearestParentByClassName(el, className) {
	var it = el.parentNode;
	while (it && !hasClass(it,className)) it = it.parentNode;
	return it;
}
function nearestPreviousSiblingByClassName(el, className) {
	var it = el.previousSibling;
	while (it && !hasClass(it,className)) it = it.previousSibling;
	return it;
}
function removeAllChildren(el) {
	var last;
	while (last = el.lastChild) el.removeChild(last);
}
function getElementsByClassName(className, parent) {
	parent = parent || d;
	return parent.getElementsByClassName(className);
}
function getElementsByTagName(tagName, parent) {
	parent = parent || d;
	return parent.getElementsByTagName(tagName);
}
function getElementById(id) {
	return d.getElementById(id);
}
function createElement(tagName) {
	return d.createElement(tagName);
}
function getMaxImageSize() {
	// on larger screens, the max width of the content is 572
	// but, keep in mind the devicePixelRatio
	var dpr = window.devicePixelRatio || 1;
	var maxPhysicalWidth = dpr * (d.documentElement.clientWidth - 20);
	if (maxPhysicalWidth < 481) {
		return "480";
	}
	else if (maxPhysicalWidth < 601 || dpr == 1) {
		return "600";
	}
	else {
		return "1200";
	}
	// never serve the 1800 version to the page; only if clicked for detail
}
function getResolutionDependentImage(path) {
	return path.replace(/(-t)?\.jpg$/, "-" + getMaxImageSize() + ".jpg");
}

/*
 * All gallery figures should be constructed to look like this:
 * 
<figure class="gallery" id="{id}-fig">
	<div class="image-container">
		<a href="/assets/images/{src-hi}" target="_blank">
			<img src="/assets/images/{src}" />
		</a>
	</div>
	<nav>
		<a>◀</a>
		<span class="counter">
			<span class="current">1</span> of {count}
		</span>
		<a>▶</a>
	</nav>
	<figcaption>{caption}</figcaption>
</figure>
 * 
 */

var strImageContainer = "image-container";
var figureTemplate = '<div class="image-container"></div>\
<nav><a title="Previous">◀</a> \
<span class="counter"><span class="current">1</span> of {count}</span> \
<a title="Next">▶</a></nav>\
<figcaption>{caption}</figcaption>\
<a class="image-link" href="{href}" target="_blank"></a>';

function createImage(src) {
	var img = new Image();
		img.src = src;
	return img;
}

function setGalleryImage(link) {
	// execute when thread frees
	setTimeout(function() {
		try {
			// find the corresponding figure
			var galleryId = nearestParentByClassName(link, "gallery").id;
			var figure = getElementById(galleryId + "-fig");
			// set the figure image
			var figureImg = getElementsByTagName("img", figure)[0];
			figureImg.src = getResolutionDependentImage(getElementsByTagName("img", link)[0].src);
			// set if portrait
			var container = getElementsByClassName(strImageContainer, figure)[0];
			var op = hasClass(link,"p")? addClass: removeClass;
			op(container, "p");
			// set the image link
			var figureLink = getElementsByTagName("a", figure)[0];
			figureLink.setAttribute("href", figureImg.src);
			// set the caption
			var caption = nearestPreviousSiblingByClassName(link, "caption");
			var figCaption = getElementsByTagName("figcaption", figure)[0];
			figCaption.innerHTML = caption.innerHTML;
		}
		catch (ex) {
			//console.log("An exception occured while setting the gallery image:");
			//console.log(ex);
		}
	}, 0);
}

d.body.addEventListener("click", function(e) {
	var link = e.target,
		parent = link.parentNode;
	// if a child of the link was clicked, just set to the link
	if (hasClass(parent, "image-link")) {
		setGalleryImage(parent);
	}
	else if (hasClass(link, "image-link")) {
		setGalleryImage(link);
	}
});	

// first, construct the gallery image viewers like a normal image-fig
var galleries = getElementsByClassName("gallery");
for (var i = 0; i < galleries.length; i++) {
	var gallery = galleries[i];
	// create the large image viewer
	var figure = createElement("figure");
		figure.className = "image-fig";
		figure.id = gallery.id + "-fig";
	// get the first caption and first image link
	var caption = getElementsByClassName("caption", gallery)[0],
		imageLinks = getElementsByClassName("image-link", gallery),
		imageLink = imageLinks[0];
	// create the contents for the image viewer
	var figContents = figureTemplate;
	figContents = figContents.replace("{href}", imageLink.getAttribute("href"));
	figContents = figContents.replace("{count}", imageLinks.length);
	/*
	var imageContainer = createElement("div"),
		imageNav = createElement("nav"),
		imageNavPrev = createElement("a"),
		imageNavNext = createElement("a"),
		imageNavCounter = createElement("span"),
		imageNavCurrent = createElement("span"),
		figcaption = createElement("figcaption"),
		figlink = imageLink.cloneNode(true);
	// change the figlink path from the thumbnail to the resolution-appropriate image
	var href = figlink.getAttribute("href");
	figlink.setAttribute("href", href.replace(/-110\./, "-1200."));
	// set up and append the image container
	imageContainer.className = strImageContainer;
	figure.appendChild(imageContainer);
	// set up and append the nav
	imageNavPrev.setAttribute("title", "Previous");
	imageNavPrev.appendChild(d.createTextNode("◀"));
	imageNavNext.setAttribute("title", "Next");
	imageNavNext.appendChild(d.createTextNode("▶"));
	imageNavCurrent.appendChild(d.createTextNode("1"));
	imageNavCounter.appendChild(imageNavCurrent);
	imageNavCounter.appendChild(d.createTextNode(" of " + imageLinks.length));
	imageNav.appendChild(imageNavPrev);
	imageNav.appendChild(imageNavCounter);
	imageNav.appendChild(imageNavNext);
	figure.appendChild(imageNav);
	*/
	// ensure the first caption and first link come from the same li
	if (caption.parentNode === imageLink.parentNode) {
		//var figcaption = createElement("figcaption");
		//figcaption.innerHTML = caption.innerHTML;
		//figure.appendChild(figcaption);
		figContents = figContents.replace("{caption}", caption.innerHTML);
	}
	// now add the click-to-view link
	//figure.appendChild(figlink);
	
	figure.innerHTML = figContents;
	// add the large image view before the gallery
	gallery.parentNode.insertBefore(figure, gallery);
}

// second, lazy load all .image-fig's
var imageFigs = getElementsByClassName("image-fig");
for (var i = 0; i < imageFigs.length; i++) {
	var imageFig = imageFigs[i];
	// get the image link
	var figlink = getElementsByClassName("image-link", imageFig)[0],
		href = figlink.getAttribute("href");
	// create the image, with smaller resolution
	var img = createImage(getResolutionDependentImage(href));
	// prevent the figlink from being re-loaded below
	figlink.className = "";
	// figlink links to original version
	figlink.setAttribute("href", href);
	// put the image inside the new figlink
	removeAllChildren(figlink);
	figlink.appendChild(img);
	// put the new figlink in the .image-fig .image-container
	var imageContainer = getElementsByClassName(strImageContainer, imageFig)[0];
	imageContainer.appendChild(figlink);
}

// finally, load the thumbnails
var imageLinks = getElementsByClassName("image-link");
for (var i = 0; i < imageLinks.length; i++) {
	var link = imageLinks[i];
	var img = createImage(link.getAttribute("href").replace(".jpg", "-t.jpg"));
	// empty the link contents
	removeAllChildren(link);
	// add the image
	link.appendChild(img);
	link.removeAttribute("href");
	link.removeAttribute("target");
	
}

})(document);
