/*
    Lazy Gallery v1.0.0

    Lazy Gallery is a simple photo gallery that injects elements into the parent html lazy-gallery element.
    It works by adding LazyGalleryItems into the LazyGallery object via the lazy-gallery-config.js file.

    After the LazyGalleryItems are added, the last step is to call the LazyGallery.init function.
*/

function LazyGalleryView(defaultGallery) {
    this.defaultGallery = defaultGallery;

}
LazyGalleryView.prototype.init = function() {
    // get the params from the URL
    var params = new URLSearchParams(window.location.search);
    var galleryNameParam = params.get("gallery");

    // If the gallery name is not specified in the URL
    if (typeof galleryNameParam !== "string" || galleryNameParam == null || galleryNameParam == undefined) {
        // try to init the default gallery
        this.loadDefaultGallery();
    } else {
        var match = allLazyGalleries.find(x => x.name.toUpperCase() == galleryNameParam.toUpperCase());
        
        if (match == undefined || match == null) {
            console.warn(`Gallery ${galleryNameParam} was not found. Loading the default gallery.`);
            this.loadDefaultGallery();
        } else {
            match.init();
        }
    }
}

LazyGalleryView.prototype.loadDefaultGallery = function() {
    if (this.defaultGallery !== undefined)
        this.defaultGallery.init();
    else {
        console.warn("No starting gallery specified in the params. No default gallery specified. Nothing will be loaded.");
    }
}

// The current instance of the lazy gallery in JS
var currentLazyGallery = null;
var allLazyGalleries = [];

// Gallery Item Object Constructor
function LazyGalleryItem(order, src, thumbnailSrc, description) {
    // Make sure the params are valid
    if (!(
        typeof order === "number"
        && typeof src === "string"
        && typeof description === "string"
    ))
    {
        console.warn("LazyGalleryItem ctor does not have valid values");
        return;
    }
    
    this.order = order;
    this.src = src;
    this.description = description;
    this.thumbnailSrc = thumbnailSrc;
}

// Gallery Constructor
function LazyGallery(name) {
    this.galleryItems = [];
    this.name = name;
    allLazyGalleries.push(this);
}

LazyGallery.prototype.add = function(LazyGalleryItem) {
    // Make sure this is a valid LazyGalleryItem
    if (!(
            typeof LazyGalleryItem === "object"
            && typeof LazyGalleryItem.order === "number"
            && typeof LazyGalleryItem.src === "string"
            && typeof LazyGalleryItem.description === "string"))
        {
            console.error("LazyGalleryItem is invalid.");
            return;
        }

    this.galleryItems.push(LazyGalleryItem);
}

LazyGallery.prototype.init = function() {
    if (!this.validate())
        return;

    // Inject elements into the lazy-gallery tag
    this.createElements();

    // Attach swipe handler to the image container
    this.attachSwipeEventHandler();

    // set the GalleryItem index to zero
    this.galleryItemIndex = 0;

    // set the instance of the current lazy gallery
    currentLazyGallery = this;

    //TODO: switch the gallery based on URL Params

    // Update the view
    this.refreshView();
}

LazyGallery.prototype.validate = function() {
    // Warnings
    if (document.querySelectorAll("lazy-gallery").length > 1)
        console.warn("There are more than one lazy-gallery elements. Only the first one will be used");

    var isValid = true;

    // Errors
    if (this.galleryItems.length < 1) {
        console.error("Gallery contains no items.");
        isValid = false;
    }

    return isValid;
}

LazyGallery.prototype.createElements = function() {
    this.galleryElement = document.querySelector("lazy-gallery");
    // also need to clear any html inside
    this.galleryElement.innerHTML = "";

    this.scrollContainerElement = document.createElement("scroll-container");
    this.thumbnailContainerElement = document.createElement("thumbnail-container");
    this.descriptionElement = document.createElement("description");
    this.imgElement = document.createElement("img");
    
    this.galleryElement.appendChild(this.scrollContainerElement);
    this.galleryElement.appendChild(this.thumbnailContainerElement);
    this.galleryElement.appendChild(this.descriptionElement);

    this.scrollContainerElement.appendChild(this.imgElement);

    // create thumbnails here
    for(x = 0; x < this.galleryItems.length; x++) {
        var imgElement = document.createElement("img");
        imgElement.src = this.galleryItems[x].thumbnailSrc;
        imgElement.setAttribute("onclick", `currentLazyGallery.goto(${x})`);
        this.thumbnailContainerElement.appendChild(imgElement)
    }

    // set the first element in thumbnail list to have the "active" attribute
    this.thumbnailContainerElement.firstChild.setAttribute("active", "");
}

LazyGallery.prototype.refreshView = function() {
    var currentItem = this.galleryItems[this.galleryItemIndex];
    
    this.imgElement.src = currentItem.src;
    this.descriptionElement.innerText = currentItem.description;
}

LazyGallery.prototype.goto = function(index) {
    console.log(index);
    
    if (index < 0 || index > this.galleryItems.length) {
        console.error(`goto index is out of range. galleryItems.length: ${this.galleryItems.length}`);
        return;
    }

    // remove the "active" attribute from the current thumbnail
    currentLazyGallery.thumbnailContainerElement.children[this.galleryItemIndex].removeAttribute("active");
    
    this.galleryItemIndex = index;

    // set the "active" attribute on the new selected thumbnail
    currentLazyGallery.thumbnailContainerElement.children[this.galleryItemIndex].setAttribute("active", "");

    this.refreshView();
}

LazyGallery.prototype.left = function() {
    var newIndex = this.galleryItemIndex < this.galleryItems.length - 1 ? this.galleryItemIndex + 1 : 0;
    this.goto(newIndex);
}

LazyGallery.prototype.right = function() {
    var newIndex = this.galleryItemIndex > 0 ? this.galleryItemIndex-1 : this.galleryItems.length - 1;
    this.goto(newIndex);
}

LazyGallery.prototype.attachSwipeEventHandler = function() {
    this.scrollContainerElement.addEventListener('touchstart', this.handleTouchStart, false);
    this.scrollContainerElement.addEventListener('touchmove', this.handleTouchMove, false);

    this.xDown = null;                                                        
    this.yDown = null;
}

LazyGallery.prototype.getTouches = function(event) {
    return event.touches;
}

LazyGallery.prototype.handleTouchStart = function(event) {
    firstTouch = currentLazyGallery.getTouches(event)[0];                                      
    currentLazyGallery.xDown = firstTouch.clientX;                                      
    currentLazyGallery.yDown = firstTouch.clientY;             
}

LazyGallery.prototype.handleTouchMove = function(event) {
    if ( !currentLazyGallery.xDown || !currentLazyGallery.yDown ) {
        return;
    }

    var xUp = event.touches[0].clientX;                                    
    var yUp = event.touches[0].clientY;

    var xDiff = currentLazyGallery.xDown - xUp;
    var yDiff = currentLazyGallery.yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) {
            /* left swipe */ 
            console.log('left swipe');
            currentLazyGallery.left();
        } else {
            /* right swipe */
            console.log('right swipe');
            currentLazyGallery.right();
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
            console.log('up swipe');
        } else { 
            /* down swipe */
            console.log('down swipe');
        }                                                                 
    }
    /* reset values */
    currentLazyGallery.xDown = null;
    currentLazyGallery.yDown = null;       
}