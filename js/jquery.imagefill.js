/*!
 * Imagefill
 * Mike Harding (@sneak)
 * v1.0.0
 * 
 * Plugin to resize an image to fill its parent element.
 * This also includes a check for once the image is loaded, and 
 * applies a loader animation until then.
 * 
 * images		: An array of strings that are paths to images (required)
 * loader		: Whether to show the loading animation. Default is true.
 * loaderHtml	: The HTML for the 'loading' animation (optional)
 * 				  Default is '<div class="imagefill-loader"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
 * 
 * Usage:		$("#block").imagefill({
 * 					images: [
 * 						"img/image1.jpg",
 * 						"img/image2.jpg",
 * 						"img/image3.jpg"
 * 					]
 * 				});
 *
 * @preserve
 */
(function($) {

	$.fn.imagefill = function(options) {
		
		var opts = $.extend({}, $.fn.imagefill.defaults, options);
		
		return this.each(function() {
			var $this = $(this);
			
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			
			if ( o.images.length === 0 ) {
				alert('Please specify at least one image');
			} else {
				var image = o.images[Math.floor(Math.random() * o.images.length)],
					$loaderHtml = $(o.loaderHtml),
					$img = $('<div class="imagefill-wrapper"><img src="' + image + '" alt="" class="imagefill-img" /></div>');
				
				$this.addClass('imagefill-parent');
				$img.prependTo($this);
				if (o.loader) {
					$loaderHtml.appendTo($this);
				}

				$this.imagesLoaded().done(function() {
					
					var $i = $img.children('img');
					
					$.fn.fill({
						width: $i.width(),
						height: $i.height(),
						img: $i,
						parent: $this
					});

					if (o.loader) {
						$loaderHtml.remove();
					}
					$this.addClass('show-imagefill');
				});
			}
		});
	};

	$.fn.imagefill.defaults = {
		images: [],
		loader: true,
		loaderHtml: '<div class="imagefill-loader"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
	};

})(jQuery);

/** 
	Fullscreen
	Mike Harding (@sneak)
	
	Altered version of the fill plugin by Jan Schneider (nanotux.com).
	Edited to resize an image relative to a specified parent, if one is supplied.
**/
(function($){

	$.fn.fill = function(options) {
		var defaults = { width: 800,  height: 600, img: $('.imagefill-img'), parent: 'window' };
		var opts = $.extend({}, defaults, options);
		
		$(document).ready(function() { opts.img.fillResizer(opts); });
		$(window).bind("resize", function() { opts.img.fillResizer(opts); });
		
		return this;
	};
	
	$.fn.fillResizer = function(options) {
		// Set bg size
		var ratio = options.height / options.width,
			$parent = $(options.parent),
			browserwidth = $parent.width(),
			browserheight = $parent.height();

		// Scale the image
		if ((browserheight/browserwidth) > ratio){
		    $(this).height(browserheight);
		    $(this).width(browserheight / ratio);
		} else {
		    $(this).width(browserwidth);
		    $(this).height(browserwidth * ratio);
		}

		// Center the image
		$(this).css('left', (browserwidth - $(this).width())/2);
		$(this).css('top', (browserheight - $(this).height())/2);

		return this;
	};
	
})(jQuery);