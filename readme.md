# GLSlideshow.js

Advanced 2D slideshow with WebGL, that provides a variety of beautiful effects with GLSL power!

Also, 2D Canvas fallback is available for WebGL disabled browsers such as IE9. (The canvas fallback only supports cross-fade)

Shaders are forked from http://transitions.glsl.io/

## Examples

- [Basic](http://yomotsu.github.io/GLSlideshow.js/examples/basic.html)
- [APIs](http://yomotsu.github.io/GLSlideshow.js/examples/apis.html)
- [Responsive](http://yomotsu.github.io/GLSlideshow.js/examples/responsive.html)

## Usage

### Standalone

Copy GLSlideshow.js from /dist/GLSlideshow.js and place it in your project. Then, Load the js file in your HTML

```html
<script src="./js/GLSlideshow.js"></script>
```

### with NPM

```
$ npm install --save scramble-text
```

then

```javascript
import ScrambleText from 'scramble-text';
```

### making GLSlideshow instance

`autoDetectRenderer()` returns either WebGL slideshow instance for modern browsers, or Canvas slideshow instance for canvas available browsers as fallback.

```html
<div id="slideshow-placeholder"></div>

<script>
var slideshow = GLSlideshow.autoDetectRenderer(
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

If you would like to use with jQuery, just append using the jQuery feature, instead of pure DOM methods.

```html
<script>
$( function () {

	var slideshow = GLSlideshow.autoDetectRenderer(
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

- function: `GLSlideshow.autoDetectRenderer( images, options )`  
  returns instance of WebGLRenderer or CanvasRenderer
- class: `GLSlideshow.WebGLRenderer( images, options )`  
  to make a WebGLRenderer instance
- class: `GLSlideshow.CanvasRenderer( images, options )`  
  to make a CanvasRenderer instance

### images (required)

An array that consists of Image elements or strings for path to image.  
Images must be hosted on the same domain or arrowed CORS.

### other options (optional)

| key        | value |
| ---        | ---   |
| `width`    | number: width in pixels |
| `height`   | number: height in pixels |
| `duration` | number: duration time in milliseconds |
| `interval` | number: interval time in milliseconds |
| `effect`   | string: name of effect *1 |

*1 Effect option currently takes following strings

- `'crossFade'`
- `'crossZoom'`
- `'directionalWipe'`
- `'cube'`
- `'wind'`
- `'ripple'`
- `'pageCurl'`

## APIs

After you made an instance, you can control using the following methods.  
For more detail, see [APIs example](http://yomotsu.github.io/GLSlideshow.js/examples/apis.html)

- `instance.pause()`
- `instance.play()`
- `instance.getCurrent()`
- `instance.getPrev()`
- `instance.getNext()`
- `instance.setSize( width, height )`
- `instance.insert( image, order )`
- `instance.remove( order )`
- `instance.replace( images )`
- `instance.transition( to )`
- `instance.setEffect( effectName [, uniforms ] )`
- `instance.dipose()`

Editable params

- `instance.duration`
- `instance.interval`

Read only params

- `instance.inTranstion`

Events

- `instance.addEventListener( 'transitionStart', function () { /* callback */ } );`
- `instance.addEventListener( 'transitionEnd',   function () { /* callback */ } );`

Static methods

- `GLSlideshow.hasCanvas()`
- `GLSlideshow.hasWebGL()`
