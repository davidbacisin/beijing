/* image gallery */
(function(d){
	
function nearestParentByClassName(el, className) {
	var it = el.parentNode;
	while (it && !it.classList.contains(className)) it = it.parentNode;
	return it;
}
function nearestPreviousSiblingByClassName(el, className) {
	var it = el.previousSibling;
	while (it && (!it.classList || !it.classList.contains(className))) it = it.previousSibling;
	return it;
}
function removeAllChildren(el) {
	var last;
	while (last = el.lastChild) el.removeChild(last);
}

/*
 * All gallery figures should be constructed and look like this:
 * 
<figure class="gallery" id="{@id}-fig">
	<img src="/assets/images/{@src-res}" />
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
			var figure = document.getElementById(galleryId + "-fig");
			// set the figure image
			var figureImg = figure.getElementsByTagName("img")[0];
			figureImg.src = link.getElementsByTagName("img")[0].src;
			// set the caption
			var caption = nearestPreviousSiblingByClassName(link, "caption");
			var figCaption = figure.getElementsByTagName("figcaption")[0];
			figCaption.innerHTML = caption.innerHTML;
		}
		catch (ex) {
			console.log("An exception occured while setting the gallery image:");
			console.log(ex);
		}
	}, 0);
}

d.body.addEventListener("click", function(e) {
	var link = e.target;
	// if a child of the link was clicked, just set to the link
	if (link.parentNode.className == "image-link") {
		link = link.parentNode;
	}
	if (link.className == "image-link") {
		setGalleryImage(link);
	}
});	

// first, construct the gallery image viewers like a normal image-fig
var galleries = d.getElementsByClassName("gallery");
for (var i = 0; i < galleries.length; i++) {
	var gallery = galleries[i];
	// create the large image viewer
	var figure = document.createElement("figure");
		figure.className = "image-fig";
		figure.id = gallery.id + "-fig";
	// get the first caption and first image link
	var caption = gallery.getElementsByClassName("caption")[0],
		imageLink = gallery.getElementsByClassName("image-link")[0];
	// create the contents for the image viewer
	var imageContainer = document.createElement("div"),
		figcaption = document.createElement("figcaption"),
		galleryNav = document.createElement("button"),
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
		var figcaption = document.createElement("figcaption");
		figcaption.innerHTML = caption.innerHTML;
		figure.appendChild(figcaption);
	}
	// now add the click-to-view link
	figure.appendChild(figlink);
	
	// add the large image view before the gallery
	gallery.parentNode.insertBefore(figure, gallery);
}

// second, lazy load all .image-fig's
var imageFigs = d.getElementsByClassName("image-fig");
for (var i = 0; i < imageFigs.length; i++) {
	var imageFig = imageFigs[i];
	// get the image link
	var figlink = imageFig.getElementsByClassName("image-link")[0],
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
	var imageContainer = imageFig.getElementsByClassName("image-container")[0];
	imageContainer.appendChild(figlink);
}

// finally, load the thumbnails
var imageLinks = d.getElementsByClassName("image-link");
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
