# GLSlideshow.js

GLSlideshow.js is a JavaScript library for advanced 2D slideshow with WebGL, that provides variety of beautiful effects with GLSL power!

Also it supports fallback in 2D Canvas for WebGL disabled browsers such as IE9. (The canvas fallback only supports cross-fade)

## Examples

- [Basic](http://yomotsu.github.io/GLSlideshow.js/examples/basic.html)
- [Responsive](http://yomotsu.github.io/GLSlideshow.js/examples/apis.html)
- [APIs](http://yomotsu.github.io/GLSlideshow.js/examples/responsive.html)

## How to use

Load the js file in your HTML
```
<script src="GLSlideshow.min.js"></script>
```

Then make a slideshow instance. `autoDetectRenderer()` returns either WebGL slideshow instance for modern browsers, or Canvas slideshow instance for canvas available browsers as fallback.

```
<div id="slideshow-placeholder"></div>

<script>
var slideshow = GLSlideshow.audoDetectRenderer(
	[ './img/1.jpg', './img/2.jpg', './img/3.jpg', './img/4.jpg' ],
	{
		width: 1024,        // optional
		height: 576,        // optional
		duration: 1000,     // optional
		interval: 5000,     // optional
		effect: 'crossZoom' // optional
	}
);

document.getElementById( 'slideshow-placeholder' ).appendChild( slideshow.domElement );
</script>
```

If you would like to use with jQuery, just append using a jQuery feature, instead of pure DOM methods.

```
<script>
$( function () {

	var slideshow = GLSlideshow.audoDetectRenderer(
		[ './img/1.jpg', './img/2.jpg', './img/3.jpg', './img/4.jpg' ],
		{
			width: 1024,        // optional
			height: 576,        // optional
			duration: 1000,     // optional
			interval: 5000,     // optional
			effect: 'crossZoom' // optional
		}
	);

	$( '#slideshow-placeholder' ).append( slideshow.domElement );

} );

</script>
```

## Constructor and Options

- function: `GLSlideshow.audoDetectRenderer( images, options )`
  returns instance of WebGLRenderer or CanvasRenderer
- class: `GLSlideshow.WebGLRenderer( images, options )`
  make a WebGLRenderer instance
- class: `GLSlideshow.CanvasRenderer( images, options )`
  make a CanvasRenderer instance

### images (required)

An array that consists of Image element or string for path to image.
images must be hosted same domain or arrowed CORS.

### othre options (optional)

| key        | value |
| ---        | ---   |
| `width`    | number: width in pixels |
| `height`   | number: height in pixels |
| `duration` | number: duration time in milli second |
| `interval` | number: interval time in milli second |
| `effect`   | string: name of effect *1 |

*1 effect option currently supoprts following effects

- `'crossFade'`
- `'crossZoom'`
- `'cube'`
- `'wind'`
- `'ripple'`
- `'pageCurl'`

## APIs

After you made a instance, you can control using following methods.

- `instance.pause()`
- `instance.play()`
- `instance.getCurrent()`
- `instance.getPrev()`
- `instance.getNext()`
- `instance.setSize( width, height )`
- `instance.insert( image, order )`
- `instance.remove( order )`
- `instance.transition( to )`
- `instance.setEffect( effectName [, uniforms ] )`

Also editable params

- `instance.duration`
- `instance.interval`
