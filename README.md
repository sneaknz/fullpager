# Fullpager plugin

A plugin to create full-screen vertically paged content. <a href="http://code.sneak.co.nz/fullpager/">http://code.sneak.co.nz/fullpager/</a>.

## Usage

After including jQuery, add the necessary required files for the plugin. This thing currently depends on a whole bunch of other plugins:

	<link href="fullpager/imagefill.css" rel="stylesheet" />
	<link href="fullpager/fullpager.css" rel="stylesheet" />

	<script src="imagesloaded.js"></script>
	<script src="jquery.imagefill.js"></script>
	<script src="isInViewport.js"></script>
	<script src="jquery.ba-throttle-debounce.js"></script>
	<script src="jquery.scrollTo.js"></script>

	<script src="jquery.fullpager.js"></script>
	
Or if you are using the combined script that bundles all these plugins together:

	<link href="imagefill.css" rel="stylesheet" />
	<link href="fullpager.css" rel="stylesheet" />

	<script src="jquery.fullpager-combined.js"></script>
	
The following HTML structure is used to set up the pages. Note that the body is used here as the overall container, but in theory you can also nest the `.fp-page` items within another block element and use that as the base container. The `.fp-header` element is optional, and will be created automatically to contain the nav if left out, however you may want to include this so you can style a logo or other header elements etc.

	<body>
	
		<div class="fp-header"></div>
	
		<div id="introduction" class="fp-page" data-title="Introduction">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="one" class="fp-page" data-title="Page Two" data-image="example/forrest-1600x800.jpg">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="two" class="fp-page" data-background="#456">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="four" class="fp-page" data-title="Page Three" data-image="http://farm6.staticflickr.com/5206/5352726192_aa9bd63ebb_b.jpg">
			<section class="fp-content">
				...
			</section>
		</div>
		
	</body>

Set up the pages by calling fullpager on the containing element, e.g:

	$("body").fullpager();

or if you wish to use another container other than `body`, reference that instead:

	$(".container").fullpager();

## Options

There are two places to set options. The first is when you call the plugin, by passing in an options object:

Option | Type | Description
:----- | :--- | :----------
pageSelector | string | The selector used to denote pages within the container. Defaults to `.fp-page`.
pagination | boolean | Whether to show prev/next links. Defaults to true.
nextText | string | The text for the 'next' page link. Defaults to 'Next'
prevText | string | The text for the 'next' page link. Defaults to 'Prev'
onScroll | callback | Optional, called on scroll when an update to check what page is in view is done. In the context of the callback, 'this' is the full object containing options and objects. Console.log the 'this' value to see what it contains.
onPageChange | callback | Optional, called when the current page is set. In the context of the callback, 'this' is same as above for onScroll.
activeNavClass | string | The class name used to denote the currently selected navigation item. Defaults to `fp-nav-active`.
activePageClass | string | The class name used to denote the currently selected page. Defaults to `fp-page-active`.
duration | int | The time of page scroll transitions, in miliseconds. Defaults to 600.

The second is on the page elements themselves, in the form of attributes:

Attribute | Type | Description
:-------- | :--- | :----------
id | string | An ID for the page block. This will also be used for navigation purposes, and will show in the URL as a hash when switching between pages via navigation. If no ID attribute is supplied, the page will be skipped when navigating via the nav or prev/next links and the hash will not be updated.
data-title | string | The title that will be used in navigation. If this is not included then the page will not be included in the nav.
data-background | hex string | Add a custom colour to the background of this page.
data-image | string | The URL to an image that will be used as the background for the page. The image will automatically scale to fill the entire background.

## To-do

- Update to use debounced resize
- Remove dependencies on other plugins