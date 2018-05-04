import EventDispatcher from './EventDispatcher.js';

const defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {Image} image HTMLImageElement
 * @param {WebGLRenderingContext} gl
 */

export default class WebGLTexture extends EventDispatcher {

	constructor( image, gl ) {

		super();

		this.image = image;

		if ( !! gl && gl instanceof WebGLRenderingContext ) {

			this.gl = gl;
			this.texture = gl.createTexture();

		}

		this.onload()

	}

	isLoaded() {

		return this.image.naturalWidth !== 0;

	}

	onload() {

		const onload = () => {

			this.image.removeEventListener( 'load', onload );
			this.setImage( this.image );

		};

		if ( this.isLoaded() ) {

			this.setImage( this.image );
			return;

		}

		this.image.addEventListener( 'load', onload );

	}

	setImage( image ) {

		const _gl = this.gl;
		let _image;

		this.image = image;

		if ( this.isLoaded() ) {

			_image = this.image;

		} else {

			_image = defaultImage;
			this.onload();

		}

		if ( ! _gl ) {

			this.dispatchEvent( { type: 'updated' } );
			return;

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
