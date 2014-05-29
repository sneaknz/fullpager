# Fullpager plugin

A plugin to create full-screen paged content, as seen on <a href="http://letterboxd.com/2013/">the Letterboxd Year In Review</a>.

## Usage

After including jQuery, add the necessary required files for the plugin. This thing depends on a buttload of plugins:

	<link href="fullpager/imagefill.css" rel="stylesheet" />
	<link href="fullpager/fullpager.css" rel="stylesheet" />

	<script src="modernizr.js"></script>
	<script src="imagesloaded.js"></script>
	<script src="jquery.imagefill.js"></script>
	<script src="isInViewport.js"></script>
	<script src="jquery.easing.1.3.js"></script>
	<script src="jquery.scrollTo.js"></script>
	<script src="jquery.lazyload.js"></script>

	<script src="jquery.fullpager.js"></script>
	
Or if you are using the combined script that bundles all these plugins together:

	<link href="imagefill.css" rel="stylesheet" />
	<link href="fullpager.css" rel="stylesheet" />

	<script src="jquery.fullpager-combined.js"></script>
	
The following HTML structure is used to set up the pages. Note that the body is used here as the overall container, but in theory you can also next the 'fp-page' items within another block element and use that as the base container. The 'fp-header' element is optional, and will be created automatically to contain the nav if left out, however you may want to include this so you can style a logo or other header elements etc.

	<body>
	
		<div class="fp-header"></div>
	
		<div id="introduction" class="fp-page" data-title="Introduction">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="one" class="fp-page" data-title="Image background" data-image="example/forrest-1600x800.jpg">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="two" class="fp-page" data-background="#456">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="four" class="fp-page" data-title="Long-form content" data-background="#678">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="three" class="fp-page" data-title="Image background 2" data-image="example/water-1600x800.jpg">
			<section class="fp-content">
				...
			</section>
		</div>
		
	</body>

Set up the pages by calling fullpager on the containing element, e.g:

	$("body").fullpager();

or

	$(".container").fullpager({
		nextText: 'Next page',
		prevText: 'Previous page'
	});

## Options

There are two places you can specify options. The first is when you call the plugin, by passing in options:

<table>
	<tr>
		<th>pagination</th>
		<td>Boolean. Whether to show prev/next links. Defaults to true.</td>
	</tr>
	<tr>
		<th>nextText</th>
		<td>String. The text for the 'next' page link. Defaults to 'Next'</td>
	</tr>
	<tr>
		<th>prevText</th>
		<td>String. The text for the 'next' page link. Defaults to 'Prev'</td>
	</tr>
	<tr>
		<th>onScroll</th>
		<td>Callback. Optional, called on scroll when an update to check what page is in view is done. In the context of the callback, 'this' is the full object containing options and objects. Console.log the 'this' value to see what it contains.</td>
	</tr>
</table>

The second is by adding attributes to individual Page elements.

<table>
	<tr>
		<th>id</th>
		<td>Required</td>
		<td>string</td>
		<td>An ID for the page block. This will also be used for navigation purposes, and will show in the URL as a hash when switching between pages via navigation.</td>
	</tr>
	<tr>
		<th>data-title</th>
		<td>Required</td>
		<td>string</td>
		<td>The title that will be used in navigation. If this is not included then the page will not be shown in the nav.</td>
	</tr>
	<tr>
		<th>data-background</th>
		<td>Optional</td>
		<td>hex string</td>
		<td>Add a custom colour to the background of this page.</td>
	</tr>
	<tr>
		<th>data-image</th>
		<td>Optional</td>
		<td>string</td>
		<td>The URL to an image that will be used as the background for the page. The image will automatically scale to fill the entire background.</td>
	</tr>
</table>

<!--
## Requirements

The plugin requires jQuery to be included in the page, and also the [imagesloaded](http://imagesloaded.desandro.com) plugin from David Desandro. A copy of the imagesloaded plugin is included with this distribution, or you can use the bundled `jquery.imagefill-combined.min.js` file which already incorporates the plugin if you don't want to include it separately.


## To-do

- TODO: Check for image load status, and if an error then select another from the array. Test with bad references to local images and also with internet disabled for web-based images.
- CONSIDER: Add options for loader animations and/or colouring.
-->