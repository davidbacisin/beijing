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

// now re-format the list into thumbnails
var imageLinks = d.getElementsByClassName("image-link");
for (var i = 0; i < imageLinks.length; i++) {
	var link = imageLinks[i];
	var img = new Image();
		img.src = link.getAttribute("href");
	// empty the link contents
	removeAllChildren(link);
	// add the image
	link.appendChild(img);
	link.removeAttribute("href");
	link.removeAttribute("target");
}

var galleries = d.getElementsByClassName("gallery");
for (var i = 0; i < galleries.length; i++) {
	var gallery = galleries[i];
	// say we have javascript
	gallery.classList.add("js");
	// create the large image viewer
	var figure = document.createElement("figure");
		figure.className = "gallery-fig";
		figure.id = gallery.id + "-fig";
	var caption = document.createElement("figcaption"),
		image = new Image();
	figure.appendChild(image);
	figure.appendChild(caption);
	
	gallery.parentNode.insertBefore(figure, gallery);
}

})(document);
