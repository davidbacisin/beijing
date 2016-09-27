/* image gallery */
(function(d){
	
function hasClass(className, el) {
	var list = el.classList;
	return list && list.contains(className);
}
function nearestParentByClassName(className, it) {
	it = it.parentNode;
	while (it && !hasClass(className,it)) it = it.parentNode;
	return it;
}
function nearestPreviousSiblingByClassName(className, it) {
	it = it.previousSibling;
	while (it && !hasClass(className,it)) it = it.previousSibling;
	return it;
}
function removeAllChildren(el, last) {
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
function getAttribute(attrName, el) {
	return el.getAttribute(attrName);
}
function getMaxImageSize() {
	// on larger screens, the max width of the content is 572
	// but, keep in mind the devicePixelRatio
	var dpr = window.devicePixelRatio || 1;
	var maxPhysicalWidth = dpr * (d.documentElement.clientWidth - 20);
	if (maxPhysicalWidth <= 480) {
		return 480;
	}
	else if (maxPhysicalWidth <= 600 || dpr == 1) {
		return 600;
	}
	else {
		return 1200;
	}
	// never serve the 1800 version to the page; only if clicked for detail
}
function getResolutionDependentImage(path) {
	return path.replace(/(-t)?\.jpg$/, "-" + getMaxImageSize() + ".jpg");
}

/*
 * All gallery figures should be constructed to look like this:
 * 
<figure class="image-fig" id="{id}-fig">
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

var strImageContainer = "image-container",
	strImageLink = "image-link";
var figureTemplate = '<div class="image-container{p}"></div>\
<nav><a class="in prev" title="Previous" href="#">◀</a> \
<span class="counter"><span class="current">1</span> of {count}</span> \
<a class="in next" title="Next" href="#">▶</a></nav>\
<figcaption>{caption}</figcaption>\
<a class="image-link" href="{href}" target="_blank"></a>';

function createImage(src, img) {
	img = new Image();
	img.src = src;
	return img;
}

function setGalleryImage(link) {
	// execute when thread frees
	setTimeout(function() {
		try {
			// find the corresponding figure
			var gallery = nearestParentByClassName("gallery", link);
			var figure = getElementById(gallery.id + "-fig");
			// set the figure image
			var linkImg = getElementsByTagName("img", link)[0];
			var figureImg = getElementsByTagName("img", figure)[0];
			figureImg.style.display = "none";
			figureImg.src = getResolutionDependentImage(linkImg.src);
			// set if portrait
			var container = getElementsByClassName(strImageContainer, figure)[0];
			var op = hasClass("p", link)? container.classList.add: container.classList.remove;
			op.call(container.classList, "p");
			figureImg.style.display = "block";
			// set the image link
			var figureLink = getElementsByTagName("a", figure)[0];
			figureLink.setAttribute("href", linkImg.src.replace("-t.", "."));
			// set the caption
			var caption = nearestPreviousSiblingByClassName("caption", link);
			var figCaption = getElementsByTagName("figcaption", figure)[0];
			figCaption.innerHTML = caption.innerHTML;
			// set the index
			var current = getElementsByClassName("current", figure)[0];
			current.textContent = getAttribute("data-index", link);
		}
		/*catch (ex) {
			console.log("An exception occured while setting the gallery image:");
			console.log(ex);
		}*/
		finally{}
	}, 0);
}

d.body.addEventListener("click", function(e) {
	var link = e.target,
		parent = link.parentNode;
	// if a child of the link was clicked, just set to the link
	if (hasClass(strImageLink, parent)) {
		e.preventDefault();
		setGalleryImage(parent);
	}
	else if (hasClass(strImageLink, link)) {
		e.preventDefault();
		setGalleryImage(link);
	}
	else if (hasClass("in", link)) {
		e.preventDefault();
		var index = parseInt(getElementsByClassName("current", parent)[0].textContent);
		// find the corresponding thumbnail li's
		var imageFigId = nearestParentByClassName("image-fig", parent).id;
		var gallery = getElementById(imageFigId.replace("-fig", ""));
		var thumbnails = getElementsByTagName("li", gallery);
		// if next, index is already one ahead of zero-based position
		// if prev, subtract two to get zero-based position
		if (hasClass("prev", link))
			index -= 2;
		// wrap index
		index = (index + thumbnails.length) % thumbnails.length;
		// select link child
		link = getElementsByClassName(strImageLink, thumbnails[index])[0];
		// set the gallery image
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
		imageLinks = getElementsByClassName(strImageLink, gallery),
		imageLink = imageLinks[0];
	// create the contents for the image viewer
	var figContents = figureTemplate;
	figContents = figContents.replace("{href}", getAttribute("href", imageLink));
	figContents = figContents.replace("{count}", imageLinks.length);
	figContents = figContents.replace("{p}", hasClass("p", imageLink)? " p": "");
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
	var figlink = getElementsByClassName(strImageLink, imageFig)[0],
		href = getAttribute("href", figlink);
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
var imageLinks = getElementsByClassName(strImageLink);
for (var i = 0; i < imageLinks.length; i++) {
	var link = imageLinks[i];
	var img = createImage(getAttribute("href", link).replace(".jpg", "-t.jpg"));
	// empty the link contents
	removeAllChildren(link);
	// determine the index of the link
	var index = 1, n = link.parentNode;
	while (n = n.previousSibling) {
		if (n.nodeName.toLowerCase() == "li") {
			index++;
		}
	}
	// add the image
	link.setAttribute("data-index", index);
	link.appendChild(img);
	link.removeAttribute("href");
	link.removeAttribute("target");
	
}

})(document);
