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
!function(e){var t={onResize:function(e,t){return onresize=function(){clearTimeout(t),t=setTimeout(e,100)},e},init:function(n){var r=location.hash;if(n.pages.length>1&&n.container.append('<p class="fp-pagination"><a href="#" class="fp-prev">'+n.prevText+'</a><a href="#" class="fp-next">'+n.nextText+"</a></p>"),n.imgBlocks=n.pages.filter(".fp-image-bg"),n.next=n.container.find(".fp-next"),n.prev=n.container.find(".fp-prev"),t.setupNav(n),r.length){var i=r.slice(1);n.current=i,n.$current=n.pages.filter("#"+i).eq(0),t.move(n,i)}else n.$current=n.pages.eq(0),n.current=n.$current.attr("id");e(document).keydown(function(e){if(!(e.altKey||e.ctrlKey||e.shiftKey||e.metaKey)){switch(e.which){case 74:t.keypress(e,1,n);break;case 40:t.keypress(e,1,n);break;case 75:t.keypress(e,-1,n);break;case 38:t.keypress(e,-1,n);break;default:return}e.preventDefault()}}),n.next.on("click",function(e){e.preventDefault();var r=t.calculateId(n,1);t.move(n,r)}),n.prev.on("click",function(e){e.preventDefault();var r=t.calculateId(n,-1);t.move(n,r)}),t.updateArrows(n);var o=null;n.win.on("scroll",function(){o&&clearTimeout(o),o=setTimeout(t.checkIfInView(n),100)}),t.checkIfInView(n),n.container.find("img.lazy").lazyload({effect:"fadeIn",threshold:n.lazyloadOffset}),t.layout(n),t.onResize(function(){t.doResize(n),t.centerContent(n)})},layout:function(n){n.pages.each(function(){var t=e(this).data("background");console.log(t),t&&e(this).css("background-color",t)}),n.imgBlocks.each(function(){var t=e(this),n=t.data("img");null!==n&&t.imagefill({images:[n]})}),t.centerContent(n)},scaleImage:function(e,t,n,r){r/n>e.imgRatio?(t.height(r),t.width(r/e.imgRatio)):(t.width(n),t.height(n*e.imgRatio))},centerContent:function(t){t.pages.find(".fp-content").each(function(){var t=e(this),n=t.closest(".fp-page");t.css("top","auto");var r=t.outerHeight(!0),i=n.outerHeight(!0),o=i-n.innerHeight(),a=(i-r)/2-o;t.css("top",a+"px")})},checkIfInView:function(n){n.pages.each(function(){e(this).isInViewport({tolerance:300})&&(n.animating||(t.updateMenu(n,e(this).attr("id")),t.updateArrows(n)))})},getIndexFromHash:function(e,t){var n=e.pages.filter("#"+t).eq(0);return e.pages.index(n)},move:function(n,r){if(n.current!==r){var i=n.pages.filter("#"+r).eq(0);n.current=r,n.$current=i,history.pushState?history.pushState(null,null,"#"+r):window.location.hash=r,n.animating=!0,e.scrollTo.window().stop(!0),e.scrollTo(i,{duration:600,easing:"easeOutQuart",onAfter:function(){n.animating=!1}}),t.updateMenu(n,r),t.updateArrows(n)}},updateArrows:function(e){var t=e.pages.index(e.$current);0===t?e.container.addClass("fp-first-page-active").removeClass("fp-last-page-active"):t===e.pages.length-1?e.container.addClass("fp-last-page-active").removeClass("fp-first-page-active"):e.container.removeClass("fp-last-page-active").removeClass("fp-first-page-active")},doResize:function(t){t.viewportWidth=t.win.width(),t.viewportHeight=t.win.height(),e.scrollTo(t.$current,{duration:600,easing:"easeOutQuart"})},updateMenu:function(e,t){e.nav.find("[data-id="+t+"]").addClass("active").siblings().removeClass("active"),e.current=t,e.$current=e.pages.filter("#"+t)},calculateId:function(e,t){var n=e.pages.index(e.$current),r=e.current;if(0===n&&-1===t||n===e.pages.length-1&&1===t);else{var i=e.pages.eq(n+=t);r=i.attr("id")}return r},keypress:function(e,n,r){if("input"!==e.target.tagName.toLowerCase()&&"button"!==e.target.tagName.toLowerCase()&&"select"!==e.target.tagName.toLowerCase()&&"textarea"!==e.target.tagName.toLowerCase()){e.preventDefault();var i=t.calculateId(r,n);t.move(r,i)}},setupNav:function(n){var r='<nav class="fp-nav"><ul>';n.pages.each(function(){var t=e(this);r+='<li data-id="'+t.attr("id")+'"><a href="#'+t.attr("id")+'">'+t.data("title")+"</a></li>"}),r+="</ul></nav>",n.container.find(".fp-header").append(r),n.nav=n.container.find(".fp-nav"),n.nav.find("a").on("click",function(r){if(Modernizr.touch){var i=e(this),o=i.parent("li").data("id");t.updateMenu(n,o)}else{r.preventDefault();var i=e(this),o=i.parent("li").data("id");t.move(n,o)}})}};e.fn.fullpager=function(n){var r=e.extend({},e.fn.fullpager.defaults,n);return this.each(function(){var n=e.meta?e.extend({},r,e(this).data()):r;n.container=e(this),n.pages=n.container.find(".fp-page"),n.win=e("window"),n.container.addClass("fp-container"),0===n.pages.length||t.init(n)})},e.fn.fullpager.defaults={pages:[],nextText:"Next",prevText:"Prev"}}(jQuery),window.Modernizr=function(e,t,n){function r(e){v.cssText=e}function i(e,t){return r(x.join(e+";")+(t||""))}function o(e,t){return typeof e===t}function a(e,t){return-1!==(""+e).indexOf(t)}function s(e,t){for(var r in e)if(v[e[r]]!==n&&(!t||t(e[r],m)))return!0}function c(e,t){var n=e.charAt(0).toUpperCase()+e.substr(1),r=(e+" "+E.join(n+" ")+n).split(" ");return!!s(r,t)}function u(){f.input=function(e){for(var t=0,n=e.length;n>t;t++)I[e[t]]=!!(e[t]in y);return I}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),f.inputtypes=function(e){for(var r=0,i,o,a,s=e.length;s>r;r++)y.setAttribute("type",o=e[r]),i="text"!==y.type,i&&(y.value=w,y.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(o)&&y.style.WebkitAppearance!==n?(h.appendChild(y),a=t.defaultView,i=a.getComputedStyle&&"textfield"!==a.getComputedStyle(y,null).WebkitAppearance&&0!==y.offsetHeight,h.removeChild(y)):/^(search|tel)$/.test(o)||(/^(url|email)$/.test(o)?i=y.checkValidity&&y.checkValidity()===!1:/^color$/.test(o)?(h.appendChild(y),h.offsetWidth,i=y.value!=w,h.removeChild(y)):i=y.value!=w)),T[e[r]]=!!i;return T}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var l="1.7",f={},d=!0,h=t.documentElement,p=t.head||t.getElementsByTagName("head")[0],g="modernizr",m=t.createElement(g),v=m.style,y=t.createElement("input"),w=":)",b=Object.prototype.toString,x=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),E="Webkit Moz O ms Khtml".split(" "),C={svg:"http://www.w3.org/2000/svg"},k={},T={},I={},L=[],M,j=function(e){var n=t.createElement("style"),r=t.createElement("div"),i;return n.textContent=e+"{#modernizr{height:3px}}",p.appendChild(n),r.id="modernizr",h.appendChild(r),i=3===r.offsetHeight,n.parentNode.removeChild(n),r.parentNode.removeChild(r),!!i},O=function(){function e(e,i){i=i||t.createElement(r[e]||"div"),e="on"+e;var a=e in i;return a||(i.setAttribute||(i=t.createElement("div")),i.setAttribute&&i.removeAttribute&&(i.setAttribute(e,""),a=o(i[e],"function"),o(i[e],n)||(i[e]=n),i.removeAttribute(e))),i=null,a}var r={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return e}(),P={}.hasOwnProperty,A;A=o(P,n)||o(P.call,n)?function(e,t){return t in e&&o(e.constructor.prototype[t],n)}:function(e,t){return P.call(e,t)},k.flexbox=function(){function e(e,t,n,r){t+=":",e.style.cssText=(t+x.join(n+";"+t)).slice(0,-t.length)+(r||"")}function n(e,t,n,r){e.style.cssText=x.join(t+":"+n+";")+(r||"")}var r=t.createElement("div"),i=t.createElement("div");e(r,"display","box","width:42px;padding:0;"),n(i,"box-flex","1","width:10px;"),r.appendChild(i),h.appendChild(r);var o=42===i.offsetWidth;return r.removeChild(i),h.removeChild(r),o},k.canvas=function(){var e=t.createElement("canvas");return!(!e.getContext||!e.getContext("2d"))},k.canvastext=function(){return!(!f.canvas||!o(t.createElement("canvas").getContext("2d").fillText,"function"))},k.webgl=function(){return!!e.WebGLRenderingContext},k.touch=function(){return"ontouchstart"in e||j("@media ("+x.join("touch-enabled),(")+"modernizr)")},k.geolocation=function(){return!!navigator.geolocation},k.postmessage=function(){return!!e.postMessage},k.websqldatabase=function(){var t=!!e.openDatabase;return t},k.indexedDB=function(){for(var t=-1,n=E.length;++t<n;){var r=E[t].toLowerCase();if(e[r+"_indexedDB"]||e[r+"IndexedDB"])return!0}return!1},k.hashchange=function(){return O("hashchange",e)&&(t.documentMode===n||t.documentMode>7)},k.history=function(){return!(!e.history||!history.pushState)},k.draganddrop=function(){return O("dragstart")&&O("drop")},k.websockets=function(){return"WebSocket"in e},k.rgba=function(){return r("background-color:rgba(150,255,150,.5)"),a(v.backgroundColor,"rgba")},k.hsla=function(){return r("background-color:hsla(120,40%,100%,.5)"),a(v.backgroundColor,"rgba")||a(v.backgroundColor,"hsla")},k.multiplebgs=function(){return r("background:url(//:),url(//:),red url(//:)"),new RegExp("(url\\s*\\(.*?){3}").test(v.background)},k.backgroundsize=function(){return c("backgroundSize")},k.borderimage=function(){return c("borderImage")},k.borderradius=function(){return c("borderRadius","",function(e){return a(e,"orderRadius")})},k.boxshadow=function(){return c("boxShadow")},k.textshadow=function(){return""===t.createElement("div").style.textShadow},k.opacity=function(){return i("opacity:.55"),/^0.55$/.test(v.opacity)},k.cssanimations=function(){return c("animationName")},k.csscolumns=function(){return c("columnCount")},k.cssgradients=function(){var e="background-image:",t="gradient(linear,left top,right bottom,from(#9f9),to(white));",n="linear-gradient(left top,#9f9, white);";return r((e+x.join(t+e)+x.join(n+e)).slice(0,-e.length)),a(v.backgroundImage,"gradient")},k.cssreflections=function(){return c("boxReflect")},k.csstransforms=function(){return!!s(["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"])},k.csstransforms3d=function(){var e=!!s(["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"]);return e&&"webkitPerspective"in h.style&&(e=j("@media ("+x.join("transform-3d),(")+"modernizr)")),e},k.csstransitions=function(){return c("transitionProperty")},k.fontface=function(){var e,n,r=p||h,i=t.createElement("style"),o=t.implementation||{hasFeature:function(){return!1}};i.type="text/css",r.insertBefore(i,r.firstChild),e=i.sheet||i.styleSheet;var a=o.hasFeature("CSS2","")?function(t){if(!e||!t)return!1;var n=!1;try{e.insertRule(t,0),n=/src/i.test(e.cssRules[0].cssText),e.deleteRule(e.cssRules.length-1)}catch(r){}return n}:function(t){return e&&t?(e.cssText=t,0!==e.cssText.length&&/src/i.test(e.cssText)&&0===e.cssText.replace(/\r+|\n+/g,"").indexOf(t.split(" ")[0])):!1};return n=a('@font-face { font-family: "font"; src: url(data:,); }'),r.removeChild(i),n},k.video=function(){var e=t.createElement("video"),n=!!e.canPlayType;if(n){n=new Boolean(n),n.ogg=e.canPlayType('video/ogg; codecs="theora"');var r='video/mp4; codecs="avc1.42E01E';n.h264=e.canPlayType(r+'"')||e.canPlayType(r+', mp4a.40.2"'),n.webm=e.canPlayType('video/webm; codecs="vp8, vorbis"')}return n},k.audio=function(){var e=t.createElement("audio"),n=!!e.canPlayType;return n&&(n=new Boolean(n),n.ogg=e.canPlayType('audio/ogg; codecs="vorbis"'),n.mp3=e.canPlayType("audio/mpeg;"),n.wav=e.canPlayType('audio/wav; codecs="1"'),n.m4a=e.canPlayType("audio/x-m4a;")||e.canPlayType("audio/aac;")),n},k.localstorage=function(){try{return!!localStorage.getItem}catch(e){return!1}},k.sessionstorage=function(){try{return!!sessionStorage.getItem}catch(e){return!1}},k.webWorkers=function(){return!!e.Worker},k.applicationcache=function(){return!!e.applicationCache},k.svg=function(){return!!t.createElementNS&&!!t.createElementNS(C.svg,"svg").createSVGRect},k.inlinesvg=function(){var e=t.createElement("div");return e.innerHTML="<svg/>",(e.firstChild&&e.firstChild.namespaceURI)==C.svg},k.smil=function(){return!!t.createElementNS&&/SVG/.test(b.call(t.createElementNS(C.svg,"animate")))},k.svgclippaths=function(){return!!t.createElementNS&&/SVG/.test(b.call(t.createElementNS(C.svg,"clipPath")))};for(var S in k)A(k,S)&&(M=S.toLowerCase(),f[M]=k[S](),L.push((f[M]?"":"no-")+M));return f.input||u(),f.crosswindowmessaging=f.postmessage,f.historymanagement=f.history,f.addTest=function(e,t){return e=e.toLowerCase(),f[e]?void 0:(t=!!t(),h.className+=" "+(t?"":"no-")+e,f[e]=t,f)},r(""),m=y=null,d&&e.attachEvent&&function(){var e=t.createElement("div");return e.innerHTML="<elem></elem>",1!==e.childNodes.length}()&&!function(e,t){function n(e){for(var t=-1;++t<a;)e.createElement(o[t])}function r(e,t){for(var n=-1,i=e.length,o,a=[];++n<i;)o=e[n],"screen"!=(t=o.media||t)&&a.push(r(o.imports,t),o.cssText);return a.join("")}var i="abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",o=i.split("|"),a=o.length,s=new RegExp("(^|\\s)("+i+")","gi"),c=new RegExp("<(/*)("+i+")","gi"),u=new RegExp("(^|[^\\n]*?\\s)("+i+")([^\\n]*)({[\\n\\w\\W]*?})","gi"),l=t.createDocumentFragment(),f=t.documentElement,d=f.firstChild,h=t.createElement("body"),p=t.createElement("style"),g;n(t),n(l),d.insertBefore(p,d.firstChild),p.media="print",e.attachEvent("onbeforeprint",function(){var e=-1,n=r(t.styleSheets,"all"),i=[],d;for(g=g||t.body;null!=(d=u.exec(n));)i.push((d[1]+d[2]+d[3]).replace(s,"$1.iepp_$2")+d[4]);for(p.styleSheet.cssText=i.join("\n");++e<a;)for(var m=t.getElementsByTagName(o[e]),v=m.length,y=-1;++y<v;)m[y].className.indexOf("iepp_")<0&&(m[y].className+=" iepp_"+o[e]);l.appendChild(g),f.appendChild(h),h.className=g.className,h.innerHTML=g.innerHTML.replace(c,"<$1font")}),e.attachEvent("onafterprint",function(){h.innerHTML="",f.removeChild(h),f.appendChild(g),p.styleSheet.cssText=""})}(e,t),f._enableHTML5=d,f._version=l,h.className=h.className.replace(/\bno-js\b/,"")+" js "+L.join(" "),f}(this,this.document),/*!
 * EventEmitter v4.2.6 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */
function(){function e(){}function t(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function n(e){return function t(){return this[e].apply(this,arguments)}}var r=e.prototype,i=this,o=i.EventEmitter;r.getListeners=function a(e){var t=this._getEvents(),n,r;if("object"==typeof e){n={};for(r in t)t.hasOwnProperty(r)&&e.test(r)&&(n[r]=t[r])}else n=t[e]||(t[e]=[]);return n},r.flattenListeners=function s(e){var t=[],n;for(n=0;n<e.length;n+=1)t.push(e[n].listener);return t},r.getListenersAsObject=function c(e){var t=this.getListeners(e),n;return t instanceof Array&&(n={},n[e]=t),n||t},r.addListener=function u(e,n){var r=this.getListenersAsObject(e),i="object"==typeof n,o;for(o in r)r.hasOwnProperty(o)&&-1===t(r[o],n)&&r[o].push(i?n:{listener:n,once:!1});return this},r.on=n("addListener"),r.addOnceListener=function l(e,t){return this.addListener(e,{listener:t,once:!0})},r.once=n("addOnceListener"),r.defineEvent=function f(e){return this.getListeners(e),this},r.defineEvents=function d(e){for(var t=0;t<e.length;t+=1)this.defineEvent(e[t]);return this},r.removeListener=function h(e,n){var r=this.getListenersAsObject(e),i,o;for(o in r)r.hasOwnProperty(o)&&(i=t(r[o],n),-1!==i&&r[o].splice(i,1));return this},r.off=n("removeListener"),r.addListeners=function p(e,t){return this.manipulateListeners(!1,e,t)},r.removeListeners=function g(e,t){return this.manipulateListeners(!0,e,t)},r.manipulateListeners=function m(e,t,n){var r,i,o=e?this.removeListener:this.addListener,a=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(r=n.length;r--;)o.call(this,t,n[r]);else for(r in t)t.hasOwnProperty(r)&&(i=t[r])&&("function"==typeof i?o.call(this,r,i):a.call(this,r,i));return this},r.removeEvent=function v(e){var t=typeof e,n=this._getEvents(),r;if("string"===t)delete n[e];else if("object"===t)for(r in n)n.hasOwnProperty(r)&&e.test(r)&&delete n[r];else delete this._events;return this},r.removeAllListeners=n("removeEvent"),r.emitEvent=function y(e,t){var n=this.getListenersAsObject(e),r,i,o,a;for(o in n)if(n.hasOwnProperty(o))for(i=n[o].length;i--;)r=n[o][i],r.once===!0&&this.removeListener(e,r.listener),a=r.listener.apply(this,t||[]),a===this._getOnceReturnValue()&&this.removeListener(e,r.listener);return this},r.trigger=n("emitEvent"),r.emit=function w(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},r.setOnceReturnValue=function b(e){return this._onceReturnValue=e,this},r._getOnceReturnValue=function x(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},r._getEvents=function E(){return this._events||(this._events={})},e.noConflict=function C(){return i.EventEmitter=o,e},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return e}):"object"==typeof module&&module.exports?module.exports=e:this.EventEmitter=e}.call(this),function(e){function t(t){var n=e.event;return n.target=n.target||n.srcElement||t,n}var n=document.documentElement,r=function(){};n.addEventListener?r=function(e,t,n){e.addEventListener(t,n,!1)}:n.attachEvent&&(r=function(e,n,r){e[n+r]=r.handleEvent?function(){var n=t(e);r.handleEvent.call(r,n)}:function(){var n=t(e);r.call(e,n)},e.attachEvent("on"+n,e[n+r])});var i=function(){};n.removeEventListener?i=function(e,t,n){e.removeEventListener(t,n,!1)}:n.detachEvent&&(i=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(r){e[t+n]=void 0}});var o={bind:r,unbind:i};"function"==typeof define&&define.amd?define("eventie/eventie",o):e.eventie=o}(this),function(e,t){"function"==typeof define&&define.amd?define(["eventEmitter/EventEmitter","eventie/eventie"],function(n,r){return t(e,n,r)}):"object"==typeof exports?module.exports=t(e,require("eventEmitter"),require("eventie")):e.imagesLoaded=t(e,e.EventEmitter,e.eventie)}(this,function e(t,n,r){function i(e,t){for(var n in t)e[n]=t[n];return e}function o(e){return"[object Array]"===h.call(e)}function a(e){var t=[];if(o(e))t=e;else if("number"==typeof e.length)for(var n=0,r=e.length;r>n;n++)t.push(e[n]);else t.push(e);return t}function s(e,t,n){if(!(this instanceof s))return new s(e,t);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=a(e),this.options=i({},this.options),"function"==typeof t?n=t:i(this.options,t),n&&this.on("always",n),this.getImages(),l&&(this.jqDeferred=new l.Deferred);var r=this;setTimeout(function(){r.check()})}function c(e){this.img=e}function u(e){this.src=e,p[e]=this}var l=t.jQuery,f=t.console,d="undefined"!=typeof f,h=Object.prototype.toString;s.prototype=new n,s.prototype.options={},s.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);for(var r=n.querySelectorAll("img"),i=0,o=r.length;o>i;i++){var a=r[i];this.addImage(a)}}},s.prototype.addImage=function(e){var t=new c(e);this.images.push(t)},s.prototype.check=function(){function e(e,i){return t.options.debug&&d&&f.log("confirm",e,i),t.progress(e),n++,n===r&&t.complete(),!0}var t=this,n=0,r=this.images.length;if(this.hasAnyBroken=!1,!r)return void this.complete();for(var i=0;r>i;i++){var o=this.images[i];o.on("confirm",e),o.check()}},s.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded;var t=this;setTimeout(function(){t.emit("progress",t,e),t.jqDeferred&&t.jqDeferred.notify&&t.jqDeferred.notify(t,e)})},s.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var t=this;setTimeout(function(){if(t.emit(e,t),t.emit("always",t),t.jqDeferred){var n=t.hasAnyBroken?"reject":"resolve";t.jqDeferred[n](t)}})},l&&(l.fn.imagesLoaded=function(e,t){var n=new s(this,e,t);return n.jqDeferred.promise(l(this))}),c.prototype=new n,c.prototype.check=function(){var e=p[this.img.src]||new u(this.img.src);if(e.isConfirmed)return void this.confirm(e.isLoaded,"cached was confirmed");if(this.img.complete&&void 0!==this.img.naturalWidth)return void this.confirm(0!==this.img.naturalWidth,"naturalWidth");var t=this;e.on("confirm",function(e,n){return t.confirm(e.isLoaded,n),!0}),e.check()},c.prototype.confirm=function(e,t){this.isLoaded=e,this.emit("confirm",this,t)};var p={};return u.prototype=new n,u.prototype.check=function(){if(!this.isChecked){var e=new Image;r.bind(e,"load",this),r.bind(e,"error",this),e.src=this.src,this.isChecked=!0}},u.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},u.prototype.onload=function(e){this.confirm(!0,"onload"),this.unbindProxyEvents(e)},u.prototype.onerror=function(e){this.confirm(!1,"onerror"),this.unbindProxyEvents(e)},u.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},u.prototype.unbindProxyEvents=function(e){r.unbind(e.target,"load",this),r.unbind(e.target,"error",this)},s}),/*!
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
function(e){e.fn.imagefill=function(t){var n=e.extend({},e.fn.imagefill.defaults,t);return this.each(function(){var t=e(this),r=e.meta?e.extend({},n,t.data()):n;if(0===r.images.length)alert("Please specify at least one image");else{var i=r.images[Math.floor(Math.random()*r.images.length)],o=e(r.loaderHtml),a=e('<div class="imagefill-wrapper"><img src="'+i+'" alt="" class="imagefill-img" /></div>');t.addClass("imagefill-parent"),a.prependTo(t),r.loader&&o.appendTo(t),t.imagesLoaded().done(function(){var n=a.children("img");e.fn.fill({width:n.width(),height:n.height(),img:n,parent:t}),r.loader&&o.remove(),t.addClass("show-imagefill")})}})},e.fn.imagefill.defaults={images:[],loader:!0,loaderHtml:'<div class="imagefill-loader"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'}}(jQuery),function(e){e.fn.fill=function(t){var n={width:800,height:600,img:e(".imagefill-img"),parent:"window"},r=e.extend({},n,t);return e(document).ready(function(){r.img.fillResizer(r)}),e(window).bind("resize",function(){r.img.fillResizer(r)}),this},e.fn.fillResizer=function(t){var n=t.height/t.width,r=e(t.parent),i=r.width(),o=r.height();return o/i>n?(e(this).height(o),e(this).width(o/n)):(e(this).width(i),e(this).height(i*n)),e(this).css("left",(i-e(this).width())/2),e(this).css("top",(o-e(this).height())/2),this}}(jQuery),/**
 * @author  Mudit Ameta
 * @license https://github.com/zeusdeux/isInViewport/blob/master/license.md MIT
 */
function(e){e.fn.isInViewport=function t(n){var r=this.get(0),i=r.getBoundingClientRect(),o=i.top,a=i.bottom,s=e(window).scrollTop()===e(document).height()-e(window).height()?!0:!1,c=""+r.offsetLeft+r.offsetTop+i.height+i.width,u=e.extend({tolerance:0,debug:!1},n),l=!1;return t.elementsAfterCurrent=t.elementsAfterCurrent||{},t.elementsAfterCurrent[c]=t.elementsAfterCurrent[c]||this.nextAll(),u.debug&&(console.log("---------------------------------------"),console.log("index: "+c),console.log("div: "+this.text().trim()),console.log("top: "+o),console.log("bottom: "+a),console.log("tolerance: "+u.tolerance),console.log("end of page: "+s),console.log("scrollTop: "+e(window).scrollTop()),console.log("doc height:"+e(document).height()),console.log("windowHeight using $(window).height(): "+e(window).height())),l=u.tolerance?o>=0?o<=u.tolerance?!0:!1:a>u.tolerance?!0:!1:o>=0&&o<=e(window).height()?!0:!1,s&&(1!==t.elementsAfterCurrent[c].length&&t.elementsAfterCurrent[c].length||(l=0>o?!1:!0)),l}}(jQuery),jQuery.easing.jswing=jQuery.easing.swing,jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,t,n,r,i){return jQuery.easing[jQuery.easing.def](e,t,n,r,i)},easeInQuad:function(e,t,n,r,i){return r*(t/=i)*t+n},easeOutQuad:function(e,t,n,r,i){return-r*(t/=i)*(t-2)+n},easeInOutQuad:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t+n:-r/2*(--t*(t-2)-1)+n},easeInCubic:function(e,t,n,r,i){return r*(t/=i)*t*t+n},easeOutCubic:function(e,t,n,r,i){return r*((t=t/i-1)*t*t+1)+n},easeInOutCubic:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t+n:r/2*((t-=2)*t*t+2)+n},easeInQuart:function(e,t,n,r,i){return r*(t/=i)*t*t*t+n},easeOutQuart:function(e,t,n,r,i){return-r*((t=t/i-1)*t*t*t-1)+n},easeInOutQuart:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t*t+n:-r/2*((t-=2)*t*t*t-2)+n},easeInQuint:function(e,t,n,r,i){return r*(t/=i)*t*t*t*t+n},easeOutQuint:function(e,t,n,r,i){return r*((t=t/i-1)*t*t*t*t+1)+n},easeInOutQuint:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t*t*t+n:r/2*((t-=2)*t*t*t*t+2)+n},easeInSine:function(e,t,n,r,i){return-r*Math.cos(t/i*(Math.PI/2))+r+n},easeOutSine:function(e,t,n,r,i){return r*Math.sin(t/i*(Math.PI/2))+n},easeInOutSine:function(e,t,n,r,i){return-r/2*(Math.cos(Math.PI*t/i)-1)+n},easeInExpo:function(e,t,n,r,i){return 0==t?n:r*Math.pow(2,10*(t/i-1))+n},easeOutExpo:function(e,t,n,r,i){return t==i?n+r:r*(-Math.pow(2,-10*t/i)+1)+n},easeInOutExpo:function(e,t,n,r,i){return 0==t?n:t==i?n+r:(t/=i/2)<1?r/2*Math.pow(2,10*(t-1))+n:r/2*(-Math.pow(2,-10*--t)+2)+n},easeInCirc:function(e,t,n,r,i){return-r*(Math.sqrt(1-(t/=i)*t)-1)+n},easeOutCirc:function(e,t,n,r,i){return r*Math.sqrt(1-(t=t/i-1)*t)+n},easeInOutCirc:function(e,t,n,r,i){return(t/=i/2)<1?-r/2*(Math.sqrt(1-t*t)-1)+n:r/2*(Math.sqrt(1-(t-=2)*t)+1)+n},easeInElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(1==(t/=i))return n+r;if(a||(a=.3*i),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return-(s*Math.pow(2,10*(t-=1))*Math.sin(2*(t*i-o)*Math.PI/a))+n},easeOutElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(1==(t/=i))return n+r;if(a||(a=.3*i),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return s*Math.pow(2,-10*t)*Math.sin(2*(t*i-o)*Math.PI/a)+r+n},easeInOutElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(2==(t/=i/2))return n+r;if(a||(a=.3*i*1.5),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return 1>t?-.5*s*Math.pow(2,10*(t-=1))*Math.sin(2*(t*i-o)*Math.PI/a)+n:s*Math.pow(2,-10*(t-=1))*Math.sin(2*(t*i-o)*Math.PI/a)*.5+r+n},easeInBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),r*(t/=i)*t*((o+1)*t-o)+n},easeOutBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),r*((t=t/i-1)*t*((o+1)*t+o)+1)+n},easeInOutBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),(t/=i/2)<1?r/2*t*t*(((o*=1.525)+1)*t-o)+n:r/2*((t-=2)*t*(((o*=1.525)+1)*t+o)+2)+n},easeInBounce:function(e,t,n,r,i){return r-jQuery.easing.easeOutBounce(e,i-t,0,r,i)+n},easeOutBounce:function(e,t,n,r,i){return(t/=i)<1/2.75?7.5625*r*t*t+n:2/2.75>t?r*(7.5625*(t-=1.5/2.75)*t+.75)+n:2.5/2.75>t?r*(7.5625*(t-=2.25/2.75)*t+.9375)+n:r*(7.5625*(t-=2.625/2.75)*t+.984375)+n},easeInOutBounce:function(e,t,n,r,i){return i/2>t?.5*jQuery.easing.easeInBounce(e,2*t,0,r,i)+n:.5*jQuery.easing.easeOutBounce(e,2*t-i,0,r,i)+.5*r+n}}),function(e){function t(e){return"object"==typeof e?e:{top:e,left:e}}var n=e.scrollTo=function(t,n,r){return e(window).scrollTo(t,n,r)};n.defaults={axis:"xy",duration:parseFloat(e.fn.jquery)>=1.3?0:1,limit:!0},n.window=function(t){return e(window)._scrollable()},e.fn._scrollable=function(){return this.map(function(){var t=this,n=!t.nodeName||-1!=e.inArray(t.nodeName.toLowerCase(),["iframe","#document","html","body"]);if(!n)return t;var r=(t.contentWindow||t).document||t.ownerDocument||t;return/webkit/i.test(navigator.userAgent)||"BackCompat"==r.compatMode?r.body:r.documentElement})},e.fn.scrollTo=function(r,i,o){return"object"==typeof i&&(o=i,i=0),"function"==typeof o&&(o={onAfter:o}),"max"==r&&(r=9e9),o=e.extend({},n.defaults,o),i=i||o.duration,o.queue=o.queue&&o.axis.length>1,o.queue&&(i/=2),o.offset=t(o.offset),o.over=t(o.over),this._scrollable().each(function(){function a(e){c.animate(f,i,o.easing,e&&function(){e.call(this,u,o)})}if(null!=r){var s=this,c=e(s),u=r,l,f={},d=c.is("html,body");switch(typeof u){case"number":case"string":if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(u)){u=t(u);break}if(u=e(u,this),!u.length)return;case"object":(u.is||u.style)&&(l=(u=e(u)).offset())}e.each(o.axis.split(""),function(e,t){var r="x"==t?"Left":"Top",i=r.toLowerCase(),h="scroll"+r,p=s[h],g=n.max(s,t);if(l)f[h]=l[i]+(d?0:p-c.offset()[i]),o.margin&&(f[h]-=parseInt(u.css("margin"+r))||0,f[h]-=parseInt(u.css("border"+r+"Width"))||0),f[h]+=o.offset[i]||0,o.over[i]&&(f[h]+=u["x"==t?"width":"height"]()*o.over[i]);else{var m=u[i];f[h]=m.slice&&"%"==m.slice(-1)?parseFloat(m)/100*g:m}o.limit&&/^\d+$/.test(f[h])&&(f[h]=f[h]<=0?0:Math.min(f[h],g)),!e&&o.queue&&(p!=f[h]&&a(o.onAfterFirst),delete f[h])}),a(o.onAfter)}}).end()},n.max=function(t,n){var r="x"==n?"Width":"Height",i="scroll"+r;if(!e(t).is("html,body"))return t[i]-e(t)[r.toLowerCase()]();var o="client"+r,a=t.ownerDocument.documentElement,s=t.ownerDocument.body;return Math.max(a[i],s[i])-Math.min(a[o],s[o])}}(jQuery),function(e,t,n,r){var i=e(t);e.fn.lazyload=function(n){function o(){var t=0;a.each(function(){var n=e(this);if(!c.skip_invisible||n.is(":visible"))if(e.abovethetop(this,c)||e.leftofbegin(this,c));else if(e.belowthefold(this,c)||e.rightoffold(this,c)){if(++t>c.failure_limit)return!1}else n.trigger("appear"),t=0})}var a=this,s,c={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:t,data_attribute:"original",skip_invisible:!0,appear:null,load:null};return n&&(r!==n.failurelimit&&(n.failure_limit=n.failurelimit,delete n.failurelimit),r!==n.effectspeed&&(n.effect_speed=n.effectspeed,delete n.effectspeed),e.extend(c,n)),s=c.container===r||c.container===t?i:e(c.container),0===c.event.indexOf("scroll")&&s.bind(c.event,function(e){return o()}),this.each(function(){var t=this,n=e(t);t.loaded=!1,n.one("appear",function(){if(!this.loaded){if(c.appear){var r=a.length;c.appear.call(t,r,c)}e("<img />").bind("load",function(){n.hide().attr("src",n.data(c.data_attribute))[c.effect](c.effect_speed),t.loaded=!0;var r=e.grep(a,function(e){return!e.loaded});if(a=e(r),c.load){var i=a.length;c.load.call(t,i,c)}}).attr("src",n.data(c.data_attribute))}}),0!==c.event.indexOf("scroll")&&n.bind(c.event,function(e){t.loaded||n.trigger("appear")})}),i.bind("resize",function(e){o()}),/iphone|ipod|ipad.*os 5/gi.test(navigator.appVersion)&&i.bind("pageshow",function(t){t.originalEvent.persisted&&a.each(function(){e(this).trigger("appear")})}),e(t).load(function(){o()}),this},e.belowthefold=function(n,o){var a;return a=o.container===r||o.container===t?i.height()+i.scrollTop():e(o.container).offset().top+e(o.container).height(),a<=e(n).offset().top-o.threshold},e.rightoffold=function(n,o){var a;return a=o.container===r||o.container===t?i.width()+i.scrollLeft():e(o.container).offset().left+e(o.container).width(),a<=e(n).offset().left-o.threshold},e.abovethetop=function(n,o){var a;return a=o.container===r||o.container===t?i.scrollTop():e(o.container).offset().top,a>=e(n).offset().top+o.threshold+e(n).height()},e.leftofbegin=function(n,o){var a;return a=o.container===r||o.container===t?i.scrollLeft():e(o.container).offset().left,a>=e(n).offset().left+o.threshold+e(n).width()},e.inviewport=function(t,n){return!(e.rightoffold(t,n)||e.leftofbegin(t,n)||e.belowthefold(t,n)||e.abovethetop(t,n))},e.extend(e.expr[":"],{"below-the-fold":function(t){return e.belowthefold(t,{threshold:0})},"above-the-top":function(t){return!e.belowthefold(t,{threshold:0})},"right-of-screen":function(t){return e.rightoffold(t,{threshold:0})},"left-of-screen":function(t){return!e.rightoffold(t,{threshold:0})},"in-viewport":function(t){return e.inviewport(t,{threshold:0})},"above-the-fold":function(t){return!e.belowthefold(t,{threshold:0})},"right-of-fold":function(t){return e.rightoffold(t,{threshold:0})},"left-of-fold":function(t){return!e.rightoffold(t,{threshold:0})}})}(jQuery,window,document);