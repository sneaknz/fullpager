// @codekit-append "../fullpager/jquery.fullpager.js";

// @codekit-append "../js/imagesloaded.js";
// @codekit-append "../js/jquery.imagefill.js";
// @codekit-append "../js/isInViewport.js";
// @codekit-append "../js/jquery.scrollTo.js";

/* **********************************************
     Begin jquery.fullpager.js
********************************************** */

/*!
 * Fullpager
 * Mike Harding (@sneak)
 * v1.2.0
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
			activeClass: 'active',
			duration: 600
		},
		
		_init: function() {
			var me = this;
			
			me.$el.addClass('fp-container');
			me.$window = $(window);
			me.$document = $(document);
			me.$pages = me.$el.find(me.options.pageSelector);
			me.touch = me._touchEnabled();
			
			if ( me.$pages.length === 0 ) {
				// No pages passed in
				logError('No pages exist for the ' + me.options.pageSelector + ' selector.');
				return;
			}
			
			me._navigation();
			
			// Set initial position if a hash exists
			var hash = location.hash;
			
			if (hash.length) {
				var h = hash.slice(1);
				me.move(h);
			} else {
				me.move( me.$pages.eq(0).attr('id') );
			}
			
			me._bindings();
			me._checkIfInView();
			me._layout();
			me.refresh();
		},
		
		_navigation: function() {
			var me = this;
			
			// Add next/prev nav
			if ( me.$pages.length > 1 && me.options.pagination ) {
				me.$el.append('<p class="fp-pagination"><a href="#" class="fp-prev">' + me.options.prevText + '</a><a href="#" class="fp-next">' + me.options.nextText + '</a></p>');
				
				me.$next = me.$el.find('.fp-next');
				me.$prev = me.$el.find('.fp-prev');
				
				me.$next.on('click', function(e){
					e.preventDefault();
					var id = me._calculateId(1);
					me.move(id);
				});
			
				me.$prev.on('click', function(e){
					e.preventDefault();
					var id = me._calculateId(-1);
					me.move(id);
				});
			}		
			
			// Add main navigation
			var nav = '<nav class="fp-nav"><ul>'; // Start the string
			
			me.$pages.each(function() {
				var $page = $(this);
				
				if ( $page.data('title') && $page.attr('id') ) {
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
				e.preventDefault();
				
				var $this = $(this),
					id = $this.parent('li').data('id');
				
				if (me.touch) {
					me._updateNav(id);
				} else {
					me.move(id);
				}
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
			
			me.$window.on('resize.' + namespace, me._resizeDelegate);
			me.$window.trigger('resize');

			me.$document.on('keydown.' + namespace, me._keydownDelegate);
			
			// Checks for whether a page is in the viewport
			me.scrollTimer = null;
			me.$window.on('scroll.' + namespace, me._scrollDelegate);
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
			
				if (history.pushState) {
					history.pushState(null, null, '#'+id);
				} else {
					window.location.hash = id;
				}

				me.animating = true;

				$.scrollTo.window().stop(true); // Cancel any exisitng scrolling first to avoid queuing
				
				$.scrollTo( $newPage, {
					duration: me.options.duration,
					easing: 'easeOutQuart',
					onAfter: function(){
						me.animating = false;
					}
				});
				
				me._setCurrent(id);
			}
		},
		
		_updateNav: function(id) {
			var me = this;
			var $li = me.$nav.find('li');
			
			$li.removeClass(me.options.activeClass).filter('[data-id=' + id + ']').addClass(me.options.activeClass);
			
			// Update prev/next
			if ( me.pagination ) {
				var pos = me.$pages.index(me.$current);
				if (pos === 0) {
					// First page, so hide 'prev' arrow
					me.$el.addClass('fp-first-page-active').removeClass('fp-last-page-active');
				} else if (pos === me.$pages.length - 1) {
					// Last page, so hide 'next' arrow
					me.$el.addClass('fp-last-page-active').removeClass('fp-first-page-active');
				} else {
					// Show the whole goddamn lot
					me.$el.removeClass('fp-last-page-active').removeClass('fp-first-page-active');
				}
			}
		},
		
		_setCurrent: function(id) {
			var me = this;
			
			if (me.current !== id) {
				me.$current = me.$pages.filter('#'+id).eq(0);
				me.current = id;
				me._updateNav(id);
				
				if ( typeof me.options.onPageChange === 'function' ) {
					me.options.onPageChange.call(me);
				}
			}
		},
		
		_calculateId: function(offset) {
			var me = this;
			
			var pos = me.$pages.index(me.$current),
				id = me.current;
				
			if ( ((pos === 0 && offset === -1) || (pos === me.$pages.length - 1 && offset === 1)) ) {
				// Can't navigate from here, so leave the same
			} else {
				var $targetPage = me.$pages.eq(pos += offset);
				id = $targetPage.attr('id');
			}
			
			return id;
		},
		
		_keydown: function(ev) {
			var me = this;
			
			// J/K and arrow navigation

			if (ev.altKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) {
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
			
			if ( me.scrollTimer ) {
				clearTimeout(me.scrollTimer);
			}
			me.scrollTimer = setTimeout(me._checkIfInView(), 100);
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
			
			if ( typeof me.options.onScroll === 'function' ) {
				me.options.onScroll.call(me);
			}
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
			
			me.viewportWidth = me.$window.width();
			me.viewportHeight = me.$window.height();
		
			me._centerContent();
			
			$.scrollTo(me.$current, {
				duration: 600,
				easing: 'easeOutQuart'
			});
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
		
		_onResize: function(c,t){
			onresize = function(){
				clearTimeout(t);
				t = setTimeout(c,100);
			};
			return c;
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

/* **********************************************
     Begin imagesloaded.js
********************************************** */

/*!
 * imagesLoaded PACKAGED v3.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */


/*!
 * EventEmitter v4.2.6 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (typeof evt === 'object') {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (type === 'object') {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define('eventEmitter/EventEmitter',[],function () {
			return EventEmitter;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
	}
}.call(this));

/*!
 * eventie v1.0.4
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false */

( function( window ) {



var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( 'eventie/eventie',eventie );
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

/*!
 * imagesLoaded v3.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) {
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventEmitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( this,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {



var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

/* **********************************************
     Begin jquery.imagefill.js
********************************************** */

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

/* **********************************************
     Begin isInViewport.js
********************************************** */

/**
 * @author  Mudit Ameta
 * @license https://github.com/zeusdeux/isInViewport/blob/master/license.md MIT
 */
(function($) {
	$.fn.isInViewport = function isInViewport(options) {
		
		var normalJsThisObj = this.get(0),
			boundingRect = normalJsThisObj.getBoundingClientRect(),
			top = boundingRect.top,
			bottom = boundingRect.bottom,
			endOfPage = ($(window).scrollTop() === ($(document).height() - $(window).height())) ? true : false,
			// hopefully this gets us a unique index in most cases
			index = "" + normalJsThisObj.offsetLeft + normalJsThisObj.offsetTop + boundingRect.height + boundingRect.width,
			settings = $.extend({
				"tolerance": 0,
				"debug": false
			}, options),
			isVisibleFlag = false;

		isInViewport.elementsAfterCurrent = isInViewport.elementsAfterCurrent || {};
		isInViewport.elementsAfterCurrent[index] = isInViewport.elementsAfterCurrent[index] || this.nextAll();

		if (settings.debug) {
			console.log("---------------------------------------");
			console.log("index: " + index);
			console.log("div: " + this.text().trim());
			console.log("top: " + top);
			console.log("bottom: " + bottom);
			console.log("tolerance: " + settings.tolerance);
			console.log("end of page: " + endOfPage);
			console.log("scrollTop: "+$(window).scrollTop());
			console.log("doc height:"+$(document).height());
			console.log("windowHeight using $(window).height(): "+$(window).height());
		}

		if (settings.tolerance) {
			if (top >= 0) {
				if (top <= settings.tolerance) {
					isVisibleFlag = true;
				} else {
					isVisibleFlag = false;
				}
			} else {
				if (bottom > settings.tolerance) {
					isVisibleFlag = true;
				} else {
					isVisibleFlag = false;
				}
			}

		} else {
			if (top >= 0 && top <= $(window).height())
				isVisibleFlag = true;
			else
				isVisibleFlag = false;
		}

		/*If its end of the page*/
		if (endOfPage) {
			/*Element before last or Last Element*/
			if ((isInViewport.elementsAfterCurrent[index].length === 1) || (!isInViewport.elementsAfterCurrent[index].length)) {
				if (top < 0)
					isVisibleFlag = false;
				else
					isVisibleFlag = true;
			}
		}
		return isVisibleFlag;

	};
})(jQuery);

/* **********************************************
     Begin jquery.scrollTo.js
********************************************** */

/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Easy element scrolling using jQuery.
 * @author Ariel Flesler
 * @version 1.4.7
 */

;(function( $ ) {
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ) {
		return $(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
		limit:true
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ) {
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function() {
		return this.map(function() {
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if (!isWin)
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
			
			return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
				doc.body : 
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ) {
		if (typeof duration == 'object') {
			settings = duration;
			duration = 0;
		}
		if (typeof settings == 'function')
			settings = { onAfter:settings };
			
		if (target == 'max')
			target = 9e9;
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if (settings.queue)
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function() {
			// Null target yields nothing, just like jQuery does
			if (target == null) return;

			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch (typeof targ) {
				// A number will pass the regex
				case 'number':
				case 'string':
					if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
					if (!targ.length) return;
				case 'object':
					// DOMElement / jQuery
					if (targ.is || targ.style)
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ) {
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if (toff) {// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if (settings.margin) {
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if(settings.over[pos])
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				} else { 
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ? 
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if (settings.limit && /^\d+$/.test(attr[key]))
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if (!i && settings.queue) {
					// Don't waste time animating, if there's no need.
					if (old != attr[key])
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );			

			function animate( callback ) {
				$elem.animate( attr, duration, settings.easing, callback && function() {
					callback.call(this, targ, settings);
				});
			};

		}).end();
	};
	
	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ) {
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;
		
		if (!$(elem).is('html,body'))
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();
		
		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] ) 
			 - Math.min( html[size]  , body[size]   );
	};

	function both( val ) {
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );