/*!
 * Fullpager
 * Mike Harding (@sneak)
 * v1.0.0
 * 
 * Plugin to create full-screen paged content, as seen on http://letterboxd.com/2013/
 * 
 * REQUIRES
 * 				modernizr.js
 * 				imagesloaded.js
 * 				jquery.imagefill.js
 * 				isInViewport.js
 * 				jquery.easing.1.3.js
 * 				jquery.scrollTo.js
 * 				jquery.lazyload.js
 * 
 * OPTIONS
 * 
 * nextText		: The text for the 'next' page link. Defaults to 'Next'
 * prevText		: The text for the 'next' page link. Defaults to 'Prev'
 * 
 * USAGE
 * 
 * $('body').fullpager();
 * $('.container').fullpager({
 * 		nextText: 'Next page',
 * 		prevText: 'Previous page'
 * });
 * 
 * @preserve
 */

(function($) {
	
	var fp = {
		onResize: function(c,t){
			onresize=function(){clearTimeout(t);t=setTimeout(c,100);};return c;
		},
		
		init: function(o){
			// Set initial position if a hash exists
			var hash = location.hash;
			
			// Add next/prev nav
			if ( o.pages.length > 1 ) {
				o.container.append('<p class="fp-pagination"><a href="#" class="fp-prev">'+o.prevText+'</a><a href="#" class="fp-next">'+o.nextText+'</a></p>');
			}

			o.imgBlocks = o.pages.filter('[data-img]');
			o.long = o.pages.filter('[data-long]');
			o.next = o.container.find('.fp-next');
			o.prev = o.container.find('.fp-prev');
			
			fp.setupNav(o);
			
			if (hash.length) {
				var h = hash.slice(1);
				o.current = h;
				o.$current = o.pages.filter('#'+h).eq(0);
				fp.move(o, h);
			} else {
				o.$current = o.pages.eq(0);
				o.current = o.$current.attr('id');
			}
			
			// J/K and arrow navigation
			$(document).keydown(function(e) {
				if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
					return;
				} else {
					switch(e.which) {
						case 74: // j
							fp.keypress(e, 1, o);
						break;
					
						case 40: // down arrow
							fp.keypress(e, 1, o);
						break;

						case 75: // k
							fp.keypress(e, -1, o);
						break;

						case 38: // up arrow
							fp.keypress(e, -1, o);
						break;

						default: return; // exit this handler for other keys
					}
					e.preventDefault();
				}
			});

			// Prev/Next arrows
			o.next.on('click', function(e){
				e.preventDefault();
				var id = fp.calculateId(o, 1);
				fp.move(o, id);
			});
			
			o.prev.on('click', function(e){
				e.preventDefault();
				var id = fp.calculateId(o, -1);
				fp.move(o, id);
			});
			
			fp.updateArrows(o);
			
			// Checks for whether a page is in the viewport
			var scrollTimer = null;

			o.win.on('scroll', function() {
				if ( scrollTimer ) {
					clearTimeout(scrollTimer);
				}
				scrollTimer = setTimeout(fp.checkIfInView(o), 100);
			});
			
			fp.checkIfInView(o);
			
			o.container.find("img.lazy").lazyload({
				effect: "fadeIn",
				threshold: o.lazyloadOffset
			});
			
			fp.layout(o);
			
			fp.onResize(function(){
				fp.doResize(o);
				fp.centerContent(o);
			});
		},
		
		layout: function(o){
			// Add background colours
			o.pages.each(function() {
				var bg = $(this).data('background');
				if (bg) {
					$(this).css('background-color', bg);
				}
			});
			
			// Set up fullscreen image backgrounds and blurs
			o.long.addClass('fp-long');

			// Set up fullscreen image backgrounds and blurs
			o.imgBlocks.each(function() {
				var $block = $(this),
					src = $block.data('img');
				
					$block.addClass('fp-image-bg');
				
				if ( src !== null ) {
					$block.imagefill({
						images: [src]
					});
				}
			});
			
			// Set up content blocks
			fp.centerContent(o);
		},
		
		scaleImage: function(o, img, w, h) {
			if ((h/w) > o.imgRatio){
				img.height(h);
				img.width(h / o.imgRatio);
			} else {
				img.width(w);
				img.height(w * o.imgRatio);
			}
		},
		
		centerContent: function(o) {
			o.pages.find('.fp-content').each(function() {
				var $content = $(this),
					$contentParent = $content.closest('.fp-page');
			
				// Reset top value
				$content.css('top', 'auto');
			
				var ch = $content.outerHeight(true),
					parentHeight = $contentParent.outerHeight(true),
					existingPadding = parentHeight - $contentParent.innerHeight(),
					offset = ((parentHeight - ch) / 2) - existingPadding;
				
				$content.css('top', offset + 'px');
			});
		},
		
		checkIfInView: function(o) {
			o.pages.each(function(){
				if ( $(this).isInViewport({ tolerance: 300 }) ) {
					if (!o.animating) {
						fp.updateMenu(o, $(this).attr('id'));
						fp.updateArrows(o);
					}
				}
			});
		},
		
		getIndexFromHash: function(o, hash) {
			var s = o.pages.filter('#'+hash).eq(0);
			return o.pages.index(s);
		},
		
		move: function(o, id) {
			if (o.current === id) {
				// Already selected
				return;
			} else {
				var $newPage = o.pages.filter('#'+id).eq(0);
					// index = fp.getIndexFromHash(o, id);
			
				o.current = id;
				o.$current =$newPage;
				
				if (history.pushState) {
					history.pushState(null, null, '#'+id);
				} else {
					window.location.hash = id;
				}

				o.animating = true;
				$.scrollTo.window().stop(true); // Cancel any exisitng scrolling first to avoid queuing
				$.scrollTo( $newPage, {
					duration: 600,
					easing: 'easeOutQuart',
					onAfter: function(){
						o.animating = false;
					}
				});
				
				fp.updateMenu(o, id);
				fp.updateArrows(o);
			}
		},
		
		updateArrows: function(o) {
			var pos = o.pages.index(o.$current);
			if (pos === 0) {
				// First page, so hide 'prev' arrow
				o.container
					.addClass('fp-first-page-active')
					.removeClass('fp-last-page-active');
			} else if (pos === o.pages.length - 1) {
				// Last page, so hide 'next' arrow
				o.container
					.addClass('fp-last-page-active')
					.removeClass('fp-first-page-active');
			} else {
				// Show the whole goddamn lot
				o.container
					.removeClass('fp-last-page-active')
					.removeClass('fp-first-page-active');
			}
		},
	
		doResize: function(o) {
			o.viewportWidth = o.win.width();
			o.viewportHeight = o.win.height();
			
			$.scrollTo(o.$current, {
				duration: 600,
				easing: 'easeOutQuart'
			});
		},
		
		updateMenu: function(o, id) {
			o.nav.find('[data-id=' + id + ']').addClass('active').siblings().removeClass('active');
			o.current = id;
			o.$current = o.pages.filter('#'+id);
		},
	
		calculateId: function(o, offset) {
			var pos = o.pages.index(o.$current),
				id = o.current;
				
			if ( ((pos === 0 && offset === -1) || (pos === o.pages.length - 1 && offset === 1)) ) {
				// Can't navigate from here, so leave the same
			} else {
				var $targetPage = o.pages.eq(pos += offset);
				id = $targetPage.attr('id');
			}
			return id;
		},
		
		keypress: function(e, direction, o) {
			if (e.target.tagName.toLowerCase() === 'input' ||
				e.target.tagName.toLowerCase() === 'button' ||
				e.target.tagName.toLowerCase() === 'select' ||
				e.target.tagName.toLowerCase() === 'textarea') {
					return;
				}
			
			e.preventDefault();
			var id = fp.calculateId(o, direction);
			fp.move(o, id);
		},
		
		setupNav: function(o) {
			
			var nav = '<nav class="fp-nav"><ul>';
			
			o.pages.each(function() {
				var $page = $(this);
				
				if ( !$page.data('hide-nav') ) {
					nav += '<li data-id="' + $page.attr('id') + '"><a href="#' + $page.attr('id') + '">' + $page.data('title') + '</a></li>';
				}
			})
			
			nav += '</ul></nav>';
			
			var $header = o.container.find('.fp-header');
			
			if ($header.length) {
				$header.append(nav);
			} else {
				$header = $('<div class="fp-header"></div>');
				$header.append(nav);
				o.container.prepend($header);
			}
			
			o.nav = $header.find('.fp-nav');

			o.nav.find('a').on('click', function(e){
				if (Modernizr.touch) {
					var $this = $(this),
						id = $this.parent('li').data('id');
						
					fp.updateMenu(o, id);
				} else {
					e.preventDefault();
					var $this = $(this),
						id = $this.parent('li').data('id');

					fp.move(o, id);
				}
			});
		}
	};
	
	$.fn.fullpager = function(options) {
		var opts = $.extend({}, $.fn.fullpager.defaults, options);
		
		return this.each(function() {
			var o = $.meta ? $.extend({}, opts, $(this).data()) : opts;
			
			o.container = $(this);
			o.pages = o.container.find('.fp-page');
			o.win = $('window');
			
			o.container.addClass('fp-container');
			
			if ( o.pages.length === 0 ) {
				// No pages to use
			} else {
				fp.init(o);
			}
		});
	};
	
	$.fn.fullpager.defaults = {
		pages: [],
		nextText: 'Next',
		prevText: 'Prev'
	};

})(jQuery);