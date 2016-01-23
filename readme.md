# GLSlideshow.js

GLSlideshow.js is a JavaScript library for advanced 2D slideshow with WebGL, that provides variety of beautiful effects with GLSL power!

Also it supports fallback in 2D Canvas for WebGL disabled browsers such as IE9. (The canvas fallback only supports cross-fade)

## Examples

- [Basic]()
- [APIs]()

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
		shader: 'crossZoom' // optional
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
			shader: 'crossZoom' // optional
		}
	);

	$( '#slideshow-placeholder' ).append( slideshow.domElement );

} );

</script>
```

## Options

function: GLSlideshow.audoDetectRenderer( images, options )
class: GLSlideshow.CanvasRenderer( images, options )
class: GLSlideshow.WebGLRenderer( images, options )

### images (requiered)

An array that consists of Image element or string for path to image.
images must be hosted same domain or arrowed CORS.

### othre options (optional)

| ---      | --- |
| width    | number: width in pixels |
| height   | number: height in pixels |
| duration | number: duration time in milli second |
| interval | number: interval time in milli second |
| shader   | string: name of shader *1 |

*1 currently supoprts following shaders

- `'crossFade'`
- `'crossZoom'`
- `'cube'`
- `'wind'`
- `'ripple'`
- `'pageCurl'`

## APIs

- `instance.pause();`
- `instance.play();`
- `instance.setSize( width, height );`
- `instance.insert( image, order );`
- `instance.remove( order );`
- `instance.transition( to );`
- `instance.setShaderProgram( shaderName [, uniforms ] );`
