/*!
 * Fullpager
 * Mike Harding (@sneak)
 * v1.2.4
 * 
 * Plugin to create full-screen verticlly paged content.
 * http://code.sneak.co.nz/fullpager/
 * 
 * @preserve
 */

;(function($) {

	// Setup and utilities
	var namespace = 'fullpager';
	var logError = typeof console === 'undefined' ? function() {} : function( message ) { console.error( message ); };
	
	// Custom easing
	$.easing.easeOutQuart = function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	};
	
	var Fullpager = function(element, options) {
		this.$el = $( element );
		this.options = $.extend( true, {}, this.defaults, options );
		this._init();
	};
	
	Fullpager.prototype = {
		defaults: {
			pageSelector: '.fp-page',
			pagination: true,
			nextText: 'Next',
			prevText: 'Prev',
			onScroll: null,
			onPageChange: null,
			activeNavClass: 'fp-nav-active',
			activePageClass: 'fp-page-active',
			duration: 600
		},
		
		_init: function() {
			var me = this;
			
			me.$el.addClass('fp-container');
			me.$window = $(window);
			me.$document = $(document);
			me.$pages = me.$el.find(me.options.pageSelector);
			me.$navigable = me.$pages.filter('[id]');
			me.touch = me._touchEnabled();
			me.scrolling = false;
			
			if ( me.$pages.length === 0 ) {
				// No pages passed in
				logError('No pages exist for the ' + me.options.pageSelector + ' selector.');
				return;
			}
			
			me._navigation();
			me._bindings();
			me._layout();
			me._centerContent();
			
			// Set initial position if a hash exists
			var hash = location.hash;
			
			if (hash.length) {
				var h = hash.slice(1);
				me._setCurrent(h);
				
				$.scrollTo.window().stop(true); // Cancel any exisitng scrolling first to avoid queuing
				
				$.scrollTo( me.$pages.filter('[id=' + h + ']'), {
					duration: 1
				});
			} else {
				me._setCurrent( me.$pages.eq(0).attr('id') );
			}
		},
		
		_navigation: function() {
			var me = this;
			
			// Add next/prev nav
			if ( me.$navigable.length > 1 && me.options.pagination ) {
				me.$el.append('<p class="fp-pagination"><a href="#" class="fp-prev">' + me.options.prevText + '</a><a href="#" class="fp-next">' + me.options.nextText + '</a></p>');
				
				me.$next = me.$el.find('.fp-next');
				me.$prev = me.$el.find('.fp-prev');
				
				me.$next.on('click', function(e){
					if ( !me.touch ) {
						e.preventDefault();
					}
					var id = me._calculateId(1);
					me.move(id);
				});
			
				me.$prev.on('click', function(e){
					if ( !me.touch ) {
						e.preventDefault();
					}
					var id = me._calculateId(-1);
					me.move(id);
				});
			}		
			
			// Add main navigation
			var nav = '<nav class="fp-nav"><ul>'; // Start the string
			
			me.$navigable.each(function() {
				var $page = $(this);
				
				if ( $page.data('title') ) {
					// Note space left at end of <li>'s to enable use of justified list layouts
					nav += '<li data-id="' + $page.attr('id') + '"><a href="#' + $page.attr('id') + '">' + $page.data('title') + '</a></li> ';
				}
			});
			
			nav += '</ul></nav>'; // End string
			
			var $header = me.$el.find('.fp-header');
			
			if ($header.length) {
				$header.append(nav);
			} else {
				$header = $('<div class="fp-header"></div>');
				$header.append(nav);
				me.$el.prepend($header);
			}
			me.$nav = $header.find('.fp-nav');

			me.$nav.find('a').on('click', function(e){
				var $this = $(this),
					id = $this.parent('li').data('id');
				
				if ( !me.touch ) {
					e.preventDefault();
				}
				
				me.move(id);
			});
		},
		
		_bindings: function() {
			var me = this;
			
			me._resizeDelegate = function() {
				return me.refresh();
			};
			
			me._keydownDelegate = function(ev) {
				return me._keydown(ev);
			};
			
			me._scrollDelegate = function(ev) {
				return me._scroll(ev);
			};
			
			me.$window.on('resize.' + namespace, $.debounce( 100, me._resizeDelegate ));
			me.$window.trigger('resize');

			me.$document.on('keydown.' + namespace, me._keydownDelegate);
			
			// Checks for whether a page is in the viewport
			me.scrollTimer = null;
			me.$window.on('scroll.' + namespace, $.throttle( 100, me._scrollDelegate ));
		},
		
		_layout: function() {
			var me = this;
			
			// Add background colours
			me.$pages.each(function() {
				var bg = $(this).data('background');
				if (bg) {
					$(this).css('background-color', bg);
				}
			});
			
			// Set up fullscreen image backgrounds and blurs
			me.$pages.filter('[data-image]').each(function() {
				
				// First check if imagefill plugin exists
				if ( $.fn.imagefill ) {
					var $block = $(this),
						src = $block.data('image');
					
					$block.addClass('fp-image-bg');
				
					if ( src !== null ) {
						$block.imagefill({
							images: [src]
						});
					}
				} else {
					logError('The imagefill plugin must be included if you want to use full bleed background images. http://code.sneak.co.nz/imagefill/');
				}
			});
		},
		
		move: function(id) {
			var me = this;
			
			if (me.current === id) {
				// Already selected
				return;
			} else {
				var $newPage = me.$pages.filter('#'+id).eq(0);
			
				me._pushState(id);
				me._setCurrent(id);
				
				if ( !me.touch ) {
					me.animating = true;

					$.scrollTo.window().stop(true); // Cancel any exisitng scrolling first to avoid queuing
				
					$.scrollTo( $newPage, {
						duration: me.options.duration,
						easing: 'easeOutQuart',
						onAfter: function(){
							me.animating = false;
						}
					});
				}
			}
		},
		
		_pushState: function(id) {
			if (history.pushState) {
				history.pushState(null, null, '#'+id);
			} else {
				window.location.hash = id;
			}
		},
		
		_updateNav: function(id) {
			var me = this;
			
			var $li = me.$nav.find('li');
			
			$li.removeClass(me.options.activeNavClass).filter('[data-id=' + id + ']').addClass(me.options.activeNavClass);
			
			// Update prev/next
			if ( me.options.pagination ) {
				var pos = me.$navigable.index(me.$current);
				if (pos === 0) {
					// First page, so hide 'prev' arrow
					me.$el.addClass('fp-first-page-active').removeClass('fp-last-page-active');
					me.$prev.attr('href', '#');
					me.$next.attr('href', '#' + me.$navigable.eq(pos + 1).attr('id'));
				} else if (pos === me.$navigable.length - 1) {
					// Last page, so hide 'next' arrow
					me.$el.addClass('fp-last-page-active').removeClass('fp-first-page-active');
					me.$next.attr('href', '#');
					me.$prev.attr('href', '#' + me.$navigable.eq(pos - 1).attr('id'));
				} else {
					// Show the whole goddamn lot
					me.$el.removeClass('fp-last-page-active').removeClass('fp-first-page-active');
					me.$prev.attr('href', '#' + me.$navigable.eq(pos - 1).attr('id'));
					me.$next.attr('href', '#' + me.$navigable.eq(pos + 1).attr('id'));
				}
			}
		},
		
		_setCurrent: function(id) {
			var me = this;
			
			if ( me.current !== id && me.$navigable.filter('#'+id).length ) {
				me.$current = me.$navigable.filter('#'+id).eq(0);
				me.current = id;
				me._updateNav(id);
				me.$current.addClass(me.options.activePageClass).siblings().removeClass(me.options.activePageClass);
				me._pushState(id);
				
				if ( typeof me.options.onPageChange === 'function' ) {
					me.options.onPageChange.call(me);
				}
			}
		},
		
		_calculateId: function(offset) {
			var me = this;
			
			var pos = me.$navigable.index(me.$current),
				id = me.current;
				
			if ( ((pos === 0 && offset === -1) || (pos === me.$navigable.length - 1 && offset === 1)) ) {
				// Can't navigate from here, so leave the same
			} else {
				var $targetPage = me.$navigable.eq(pos += offset);
				id = $targetPage.attr('id');
			}
			
			return id;
		},
		
		_keydown: function(ev) {
			var me = this;
			
			// J/K and arrow navigation
			if ( ev.target.tagName.toUpperCase() === 'INPUT' || ev.target.tagName.toUpperCase() === 'TEXTAREA' ) {
				return;
			} else if (ev.altKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) {
				return;
			} else {
				switch(ev.which) {
					case 74: // j
						me._keypress(ev, 1);
					break;
			
					case 40: // down arrow
						me._keypress(ev, 1);
					break;

					case 75: // k
						me._keypress(ev, -1);
					break;

					case 38: // up arrow
						me._keypress(ev, -1);
					break;

					default: return; // exit this handler for other keys
				}
				ev.preventDefault();
			}
		},
		
		_keypress: function(e, direction) {
			var me = this;
			
			if (e.target.tagName.toLowerCase() === 'input' ||
				e.target.tagName.toLowerCase() === 'button' ||
				e.target.tagName.toLowerCase() === 'select' ||
				e.target.tagName.toLowerCase() === 'textarea') {
					return;
				}
			
			e.preventDefault();
			var id = me._calculateId(direction);
			me.move(id);
		},
		
		_scroll: function() {
			var me = this;
			
			if ( !me.animating ) {
				me.scrolling = true;
			
				if ( me.scrollTimer ) {
					clearTimeout(me.scrollTimer);	
				}

				me.scrollTimer = setTimeout(function() {
					me._checkIfInView();
					me.scrolling = false;
				}, 100);
			}
				
			if ( typeof me.options.onScroll === 'function' ) {
				me.options.onScroll.call(me);
			}
		},
		
		_checkIfInView: function() {
			var me = this;
			
			me.$pages.each(function(){
				if ( $(this).isInViewport({ tolerance: 300 }) ) {
					if (!me.animating) {
						me._setCurrent( $(this).attr('id') );
					}
				}
			});
		},
		
		_centerContent: function() {
			var me = this;
			
			me.$pages.find('.fp-content').each(function() {
				var $content = $(this),
					$contentParent = $content.closest('.fp-page');
			
				// Reset values before checking sizes
				$contentParent.removeClass('fp-long');
				$content.css('top', 'auto');
			
				var ch = $content.outerHeight(true),
					parentHeight = $contentParent.outerHeight(true),
					existingPadding = parentHeight - $contentParent.innerHeight(),
					offset = ((parentHeight - ch) / 2) - existingPadding;
					
				if ( ch >= parentHeight ){
					$contentParent.addClass('fp-long');
				} else {
					$content.css('top', offset + 'px');
				}
			});
		},
		
		refresh: function() {
			var me = this;

			me._centerContent();
			
			if ( !me.scrolling ) {
				$.scrollTo.window().stop(true); // Cancel any exisitng scrolling first to avoid queuing
				me.animating = true;

				$.scrollTo(me.$current, {
					duration: me.options.duration,
					easing: 'easeOutQuart',
					onAfter: function(){
						me.animating = false;
					}
				});
			}
		},
		
		destroy: function() {
			var me = this;
			
			// Remove stuff
			me.$window.off('resize.' + namespace, me._resizeDelegate);
			me.$document.off('keydown.' + namespace, me._keydownDelegate);
			me.$window.off('scroll.' + namespace, me._scrollDelegate);
			me.$next.remove();
			me.$prev.remove();
			me.$nav.remove();
		},
		
		_touchEnabled: function() {
			 return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
		},
		
		option: function(opts) {
			if ( $.isPlainObject( opts ) ) {
				this.options = $.extend( true, this.options, opts );
			}
		}
	};
	
	$.fn[namespace] = function( options ) {
	
		if ( typeof options === 'string' ) {
			// call plugin method when first argument is a string
			// get arguments for method
			var args = Array.prototype.slice.call( arguments, 1 );

			for ( var i=0, len = this.length; i < len; i++ ) {
				var elem = this[i];
				var instance = $.data( elem, namespace );
				if ( !instance ) {
					logError( "cannot call methods on " + namespace + " prior to initialization; " +
					"attempted to call '" + options + "'" );
					continue;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
					logError( "no such method '" + options + "' for " + namespace + " instance" );
					continue;
				}

				// trigger method with arguments
				var returnValue = instance[ options ].apply( instance, args );

				// break look and return first value if provided
				if ( returnValue !== undefined ) {
					return returnValue;
				}
			}
			// return this if no return value
			return this;
		} else {
			return this.each( function() {
				var instance = $.data( this, namespace );
				if ( instance ) {
					// apply options & init
					instance.option( options || {} );
					instance._init();
				} else {
					// initialize new instance
					instance = new Fullpager( this, options );
					$.data( this, namespace, instance );
				}
			});
		}
	};
	

})(jQuery);