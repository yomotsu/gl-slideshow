import EventDispatcher from './EventDispatcher.js';

var textureCanvas = document.createElement( 'canvas' );
var textureCanvasContext = textureCanvas.getContext( '2d' );
var defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

var isPowerOfTwo = function ( value ) {

	return ( value & ( value - 1 ) ) === 0 && value !== 0;

}

var nextHighestPowerOfTwo = function ( value ) {

	return Math.pow( 2, Math.round( Math.log( value ) / Math.LN2 ) );

}

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
		var w, h, potw, poth;

		this.image = image;

		if ( isLoaded ) {

			w = image.naturalWidth;
			h = image.naturalHeight;

			// TODO find a way to detect NPOT supported
			// if ( supportsNPOT ) {

			// 	_image = defaultImage;

			// }

			if ( isPowerOfTwo( w ) && isPowerOfTwo( h ) ) {

				_image = defaultImage;

			} else {

				// according to the spec
				// https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
				// NPOT textures supposed to be supported.
				// but IE11 and iOS does not accept NPOT

				// Scale up the texture to the next highest power of two dimensions.
				potw = nextHighestPowerOfTwo( w );
				poth = nextHighestPowerOfTwo( h );
				textureCanvas.width  = potw;
				textureCanvas.height = poth;
				textureCanvasContext.drawImage( image, 0, 0, w, h, 0, 0, potw, poth );
				_image = textureCanvas;

			}

		} else {

			_image = defaultImage;

		}

		_gl.bindTexture( _gl.TEXTURE_2D, this.texture );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, true );
		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

		this.dispatchEvent( { type: 'updated' } );

	}

}

EventDispatcher.prototype.apply( WebGLTexture.prototype );
