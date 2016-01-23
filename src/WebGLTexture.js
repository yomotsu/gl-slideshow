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

		this.image = image;

		if ( isLoaded ) {

			_image = this.image;

		} else {

			_image = defaultImage;

		}

		_gl.bindTexture( _gl.TEXTURE_2D, this.texture );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, true );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

		this.dispatchEvent( { type: 'updated' } );

	}

}

EventDispatcher.prototype.apply( WebGLTexture.prototype );
