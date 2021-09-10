# gl-slideshow

An advanced 2D slideshow with WebGL, provides a variety of beautiful effects with GLSL power.

[![Latest NPM release](https://img.shields.io/npm/v/GLSlideshow.svg)](https://www.npmjs.com/package/GLSlideshow)

Shaders are forked from https://gl-transitions.com/

## Working Examples

- [Basic](http://yomotsu.github.io/gl-slideshow/examples/basic.html)
- [APIs](http://yomotsu.github.io/gl-slideshow/examples/apis.html)
- [Responsive](http://yomotsu.github.io/gl-slideshow/examples/responsive.html)
- [Responsive-breakpoint](http://yomotsu.github.io/gl-slideshow/examples/responsive-breakpoint.html)
- [Cover scale](http://yomotsu.github.io/gl-slideshow/examples/cover.html)
- [Custom shader](http://yomotsu.github.io/gl-slideshow/examples/shader.html)
- [Custom shader w/ additional texture](http://yomotsu.github.io/gl-slideshow/examples/shader-image.html)

## Usage

```
$ npm install --save GLSlideshow
```

then

```javascript
import GLSlideshow from 'GLSlideshow';
```

### Traditional way in web browser

Copy GLSlideshow.js from `/dist/gl-slideshow.js` and place it in your project. Then, Load the js file in your HTML

```html
<script src="./path/to/gl-slideshow.js"></script>
```

### Make a GLSlideshow instance

```html
<canvas id="myCanvas"></canvas>

<script>
const slideshow = new GLSlideshow(
	[ './img/1.jpg', './img/2.jpg', './img/3.jpg', './img/4.jpg' ],
	{
		canvas: document.getElementById( 'myCanvas' ), // optional
		width: 1024,        // optional
		height: 576,        // optional
		duration: 1000,     // optional
		interval: 5000,     // optional
		effect: 'crossZoom' // optional
	}
);
</script>
```

## Constructor and Options

```js
new GLSlideshow( images, options );
```

### images (required)

An array consists of HTMLImageElements or strings for path to image.  
Images must be hosted on the same domain or arrowed CORS.

### Options

| key           | type                | value |
| ------------- | ------------------- | ----- |
| `canvas`      | `HTMLCanvasElement` | The canvas element |
| `width`       | `number`            | width in pixels |
| `height`      | `number`            | height in pixels |
| `imageAspect` | `number`            | aspect ratio of the image (assume all images are the same aspect ratio) |
| `duration`    | `number`            | duration time in milliseconds |
| `interval`    | `number`            | interval time in milliseconds |
| `effect`      | `string`            | name of effect ***1** |

***1** Effect option currently takes following strings

- `'crossFade'`
- `'crossZoom'`
- `'directionalWipe'`
- `'wind'`
- `'ripple'`
- `'pageCurl'`

## APIs

After you made an instance, you can control using the following methods.  
For more detail, see [APIs example](http://yomotsu.github.io/GLSlideshow.js/examples/apis.html)

- `instance.pause()`
- `instance.play()`
- `instance.setSize( width, height )`
- `instance.insert( image, order )`
- `instance.remove( order )`
- `instance.replace( images )`
- `instance.to( to )`
- `instance.setEffect( effectName [, uniforms ] )`
- `instance.destroy()`

Editable params

- `instance.duration`
- `instance.interval`

Read only params

- `instance.domElement`
- `instance.inTransition`
- `instance.length`
- `instance.currentIndex`
- `instance.prevIndex`
- `instance.nextIndex`

Events

- `instance.addEventListener( 'transitionStart', () => { /* callback */ } );`
- `instance.addEventListener( 'transitionEnd',   () => { /* callback */ } );`

Static methods

- `GLSlideshow.addShader( 'shaderName', shaderSource, uniforms )`
