import EventDispatcher from './EventDispatcher.js';

var textureCanvas = document.createElement( 'canvas' );
var textureCanvasContext = textureCanvas.getContext( '2d' );
var defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {WebGLRenderingContext} gl
 * @param {Image} image HTMLImageElement
 */

export default class WebGLTexture {

	constructor ( gl, image ) {

		this.gl = gl;
		this.texture = gl.createTexture();
		this.setImage( image );
		this.onload = this.setImage.bind( this, this.image );

		this.image.addEventListener( 'load', this.onload );

		// document.body.appendChild( this.textureCanvas );

		return this;

	}

	setImage ( image ) {

		var _gl = this.gl;
		var isLoaded = image.naturalWidth !== 0;
		var _image;
		var w, h, size;

		this.image = image;

		if ( isLoaded ) {

			w = image.naturalWidth;
			h = image.naturalHeight;
			// largest 2^n integer that does not exceed s
			size = Math.pow( 2, Math.log( Math.max( w, h ) ) / Math.LN2 | 0 );

			textureCanvas.height = textureCanvas.width = size;
			textureCanvasContext.drawImage( image, 0, 0, w, h, 0, 0, size, size );
			_image = textureCanvas;

		} else {

			_image = defaultImage;

		}

		_gl.bindTexture( _gl.TEXTURE_2D, this.texture );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, true );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image );
		_gl.generateMipmap( _gl.TEXTURE_2D );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

		this.dispatchEvent( { type: 'updated' } );

	}

}

EventDispatcher.prototype.apply( WebGLTexture.prototype );
