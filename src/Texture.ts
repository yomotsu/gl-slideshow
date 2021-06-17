import type { TextureSource } from './types';
import { EventDispatcher } from './EventDispatcher';
import { isPowerOfTwo } from './webgl-utils';

const defaultImage = document.createElement( 'canvas' );
defaultImage.width = 2;
defaultImage.height = 2;

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {Image} image HTMLImageElement
 * @param {WebGLRenderingContext} gl
 */

export class Texture extends EventDispatcher {

	image: TextureSource;
	gl: WebGLRenderingContext;
	texture: WebGLTexture;

	constructor( image: TextureSource, gl: WebGLRenderingContext ) {

		super();

		this.image = image;
		this.gl = gl;
		this.texture = gl.createTexture()!;
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array( [ 0, 0, 0, 255 ] ),
		);

		this.onload();

	}

	isLoaded(): boolean {

		if ( this.image instanceof HTMLCanvasElement ) return true;
		return this.image.naturalWidth !== 0;

	}

	onload(): void {

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

	setImage( image: TextureSource ): void {

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

		const width  = this.image instanceof HTMLImageElement ? this.image.naturalWidth  : this.image.width;
		const height = this.image instanceof HTMLImageElement ? this.image.naturalHeight : this.image.height;
		const isPowerOfTwoSize = isPowerOfTwo( width ) && isPowerOfTwo( height );

		_gl.bindTexture( _gl.TEXTURE_2D, this.texture );
		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, true );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, isPowerOfTwoSize ? _gl.LINEAR_MIPMAP_NEAREST : _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
		_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

		// const anisotropicExtension =
		// 	_gl.getExtension( 'EXT_texture_filter_anisotropic' ) ||
		// 	_gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) ||
		// 	_gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );
		// if ( anisotropicExtension ){

		// 	const maxAnisotropy = _gl.getParameter( anisotropicExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );
		// 	_gl.texParameterf( _gl.TEXTURE_2D, anisotropicExtension.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy );

		// }

		_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image );

		if ( isPowerOfTwoSize ) _gl.generateMipmap( _gl.TEXTURE_2D );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

		this.dispatchEvent( { type: 'updated' } );

	}

}
