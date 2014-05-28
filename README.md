# Fullpager plugin

A plugin to create full-screen paged content, as seen on <a href="http://letterboxd.com/2013/">the Letterboxd Year In Review</a>.

## Usage

After including jQuery, add the necessary required files for the plugin. This thing depends on a buttload of plugins:

	<link href="fullpager/imagefill.css" rel="stylesheet" />
	<link href="fullpager/fullpager.css" rel="stylesheet" />

	<script src="js/modernizr.js"></script>
	<script src="js/imagesloaded.js"></script>
	<script src="js/jquery.imagefill.js"></script>
	<script src="js/isInViewport.js"></script>
	<script src="js/jquery.easing.1.3.js"></script>
	<script src="js/jquery.scrollTo.js"></script>
	<script src="js/jquery.lazyload.js"></script>
	<script src="fullpager/jquery.fullpager.js"></script>
	
Or if you are using the combined script that bundles all these plugins together:

	<link href="fullpager/imagefill.css" rel="stylesheet" />
	<link href="fullpager/fullpager.css" rel="stylesheet" />
	<script src="fullpager/jquery.fullpager-combined.js"></script>
	
The following HTML structure is used to set up the pages. Note that the body is used here as the overall container, but in theory you can also next the 'fp-page' items within another block element and use that as the base container. The 'fp-header' element is optional, and will be created automatically to contain the nav if left out, however you may want to include this so you can style a logo or other header elements etc.

	<body>
	
		<div class="fp-header"></div>
	
		<div id="introduction" class="fp-page" data-title="Introduction">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="one" class="fp-page fp-image-bg" data-title="Image background" data-img="example/forrest-1600x800.jpg">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="two" class="fp-page" data-title="Custom Background Colour" data-background="#456" data-hide-nav="true">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="four" class="fp-page fp-long-page fp-content-section" data-title="Long-form content" data-background="#678">
			<section class="fp-content">
				...
			</section>
		</div>

		<div id="three" class="fp-page fp-image-bg" data-title="Image background 2" data-img="example/water-1600x800.jpg">
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
		<th>nextText</th>
		<td>The text to be shown for the 'next' page link label</td>
	</tr>
	<tr>
		<th>prevText</th>
		<td>The text to be shown for the 'previous' page link label</td>
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
		<td>The title that will be used in navigation.</td>
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
	<tr>
		<th>data-hide-nav</th>
		<td>Optional</td>
		<td>boolean</td>
		<td>Use this to hide a page from the navigation.</td>
	</tr>
	<tr>
		<th>data-long</th>
		<td>Optional</td>
		<td>boolean</td>
		<td>For content that will likely be longer than the browser height. This will allow the page block to be taller than the browser window. In future this will automatically be set, but for now it's manual.</td>
	</tr>
</table>

<!--
## Requirements

The plugin requires jQuery to be included in the page, and also the [imagesloaded](http://imagesloaded.desandro.com) plugin from David Desandro. A copy of the imagesloaded plugin is included with this distribution, or you can use the bundled `jquery.imagefill-combined.min.js` file which already incorporates the plugin if you don't want to include it separately.


## To-do

- TODO: Check for image load status, and if an error then select another from the array. Test with bad references to local images and also with internet disabled for web-based images.
- CONSIDER: Add options for loader animations and/or colouring.
-->