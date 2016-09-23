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

/*
 * All gallery figures should be constructed and look like this:
 * 
<figure class="gallery" id="{@id}-fig">
	<div class="image-container">
		<a href="/assets/images/{@src-hi-res}" target="_blank">
			<img src="/assets/images/{@src-res}" />
		</a>
	</div>
	<figcaption>Caption</figcaption>
</figure>
 * 
 */

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
			figureImg.src = getElementsByTagName("img", link)[0].src;
			// set if portrait
			var container = getElementsByClassName("image-container", figure)[0];
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
			console.log("An exception occured while setting the gallery image:");
			console.log(ex);
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
		imageLink = getElementsByClassName("image-link", gallery)[0];
	// create the contents for the image viewer
	var imageContainer = createElement("div"),
		figcaption = createElement("figcaption"),
		galleryNav = createElement("button"),
		figlink = imageLink.cloneNode(true);
	// change the figlink path from the thumbnail to the resolution-appropriate image
	var href = figlink.getAttribute("href");
	figlink.setAttribute("href", href.replace(/-110\./, "-1200."));
	
	imageContainer.className = "image-container";
	figure.appendChild(imageContainer);
	
	galleryNav.innerHTML = "Next"
	figure.appendChild(galleryNav);
	// ensure the first caption and first link come from the same li
	if (caption.parentNode === imageLink.parentNode) {
		var figcaption = createElement("figcaption");
		figcaption.innerHTML = caption.innerHTML;
		figure.appendChild(figcaption);
	}
	// now add the click-to-view link
	figure.appendChild(figlink);
	
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
	// create the image
	var img = createImage(href);
	// prevent the figlink from being re-loaded below
	figlink.className = "";
	// convert the figlink to link to a larger version
	figlink.setAttribute("href", href.replace(/-[0-9]+\./, "-1200."));
	// put the image inside the new figlink
	removeAllChildren(figlink);
	figlink.appendChild(img);
	// put the new figlink in the .image-fig .image-container
	var imageContainer = getElementsByClassName("image-container", imageFig)[0];
	imageContainer.appendChild(figlink);
}

// finally, load the thumbnails
var imageLinks = getElementsByClassName("image-link");
for (var i = 0; i < imageLinks.length; i++) {
	var link = imageLinks[i];
	var img = createImage(link.getAttribute("href"));
	// empty the link contents
	removeAllChildren(link);
	// add the image
	link.appendChild(img);
	link.removeAttribute("href");
	link.removeAttribute("target");
	
}

})(document);
