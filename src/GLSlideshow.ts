import type { TextureSource, ImageSource, Images, GLSlideshowOptions } from './types';
import { EventDispatcher } from './EventDispatcher';
import { MAX_TEXTURE_SIZE, getWebglContext, ceilPowerOfTwo, isPowerOfTwo } from './webgl-utils';
import { Texture } from './Texture';
import {
	Uniforms,
	VERTEX_SHADER_SOURCE,
	FRAGMENT_SHADER_SOURCE_HEAD,
	FRAGMENT_SHADER_SOURCE_FOOT,
	getShader,
	addShader,
} from './shader-lib';

const UV = new Float32Array( [
	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
] );

export class GLSlideshow extends EventDispatcher {

	static addShader( effectName: string, source: string, uniforms: Uniforms ): void {
		addShader( effectName, source, uniforms );
	}

	static convertPowerOfTwo( image: HTMLImageElement ): TextureSource {

		const $canvas = document.createElement( 'canvas' );

		if ( image.naturalWidth === 0 ) {

			console.warn( 'Image must be loaded before converting' );
			return image;

		}

		const width = Math.min( ceilPowerOfTwo( image.naturalWidth ), MAX_TEXTURE_SIZE );
		const height = Math.min( ceilPowerOfTwo( image.naturalHeight ), MAX_TEXTURE_SIZE );

		if ( isPowerOfTwo( width ) && isPowerOfTwo( height ) ) return image;
		$canvas.width = width;
		$canvas.height = height;

		$canvas.getContext( '2d' )?.drawImage( image, 0, 0, width, height );
		return $canvas;

	}

	duration: number = 1000;
	interval: number = 5000;

	private _currentIndex: number = 0;
	private _startTime: number = 0;
	private _elapsedTime: number = 0;
	private _pauseStartTime?: number;
	private _transitionStartTime: number = 0;
	private _progress: number = 0;
	private _isRunning: boolean = true;
	private _inTransition: boolean = false;
	private _hasUpdated: boolean = true;
	private _domElement: HTMLCanvasElement;
	private _images: TextureSource[] = [];
	private _from!: Texture;
	private _to!: Texture;
	private _resolution: Float32Array = new Float32Array( [ 0, 0 ] );
	private _imageAspect: number;
	private _destroyed: boolean = false;
	private _extraTextures: Texture[] = [];

	private _vertexes: Float32Array = new Float32Array( [
		- 1, - 1,
		  1, - 1,
		- 1,   1,
		  1, - 1,
		  1,   1,
		- 1,   1,
	] );
	private _gl: WebGLRenderingContext;
	private _vertexShader: WebGLShader;
	private _fragmentShader!: WebGLShader | null;
	private _program!: WebGLProgram | null;
	private _vertexBuffer: WebGLBuffer;
	private _uvBuffer: WebGLBuffer;
	private _uniformLocations!: {
		progress       : WebGLUniformLocation | null,
		resolution     : WebGLUniformLocation | null,
		from           : WebGLUniformLocation | null,
		to             : WebGLUniformLocation | null,
		[ key: string ]: WebGLUniformLocation | null,
	};

	constructor( images: Images, options: GLSlideshowOptions = {} ) {

		super();

		this._startTime = Date.now();
		this.duration = options && options.duration || 1000;
		this.interval = Math.max( options && options.interval || 5000, this.duration );
		this._domElement = options && options.canvas || document.createElement( 'canvas' );

		images.forEach( ( image, i ) => this.insert( image, i ) );

		this._resolution[ 0 ] = options.width || this._domElement.width;
		this._resolution[ 1 ] = options.height || this._domElement.height;
		this._imageAspect = options.imageAspect || this._resolution[ 0 ] / this._resolution[ 1 ];

		this._gl = getWebglContext( this._domElement );
		this._vertexBuffer = this._gl.createBuffer()!;
		this._uvBuffer = this._gl.createBuffer()!;
		this._vertexShader = this._gl.createShader( this._gl.VERTEX_SHADER )!;
		this._gl.shaderSource( this._vertexShader, VERTEX_SHADER_SOURCE );
		this._gl.compileShader( this._vertexShader );

		this.setEffect( options.effect || 'crossFade' );

		const tick = () => {

			if ( this._destroyed ) return;
			if ( this._isRunning ) this._elapsedTime = Date.now() - this._startTime;

			requestAnimationFrame( tick );

			if ( this.interval + this.duration < this._elapsedTime ) {

				this.to( this.nextIndex );
				// transition start

			}

			if ( this._hasUpdated ) this.render();

		};
		tick();

	}

	get domElement(): HTMLCanvasElement {

		return this._domElement;

	}

	get currentIndex(): number {

		return this._currentIndex;

	}

	get nextIndex(): number {

		return ( this._currentIndex < this.length - 1 ) ? this._currentIndex + 1 : 0;

	}

	get prevIndex(): number {

		return ( this._currentIndex !== 0 ) ? this._currentIndex - 1 : this.length - 1;

	}

	get length(): number {

		return this._images.length;

	}

	get inTransition():boolean {

		return this._inTransition;

	}

	to( to: number ) {

		this._from.setImage( this._images[ this._currentIndex ] );
		this._to.setImage( this._images[ to ] );

		this._transitionStartTime = Date.now();
		this._startTime = Date.now();
		this._currentIndex = to;
		this._inTransition = true;
		this._hasUpdated = true;
		this.dispatchEvent( { type: 'transitionStart' } );

	}

	play() {

		if ( this._isRunning ) return this;

		const pauseElapsedTime = Date.now() - ( this._pauseStartTime || 0 );
		this._startTime += pauseElapsedTime;
		this._isRunning = true;

		delete this._pauseStartTime;
		return this;

	}

	pause() {

		if ( ! this._isRunning ) return this;

		this._isRunning = false;
		this._pauseStartTime = Date.now();

		return this;

	}

	insert( image: ImageSource, order: number ) {

		const onload = ( event: Event ) => {

			if ( ! ( event.target instanceof Element ) ) return;
			this._hasUpdated = true;
			event.target.removeEventListener( 'load', onload );

		};

		if ( image instanceof HTMLImageElement && image.naturalWidth !== 0 ) {

			image.addEventListener( 'load', onload );

		} else if ( typeof image === 'string' ) {

			const src = image;
			image = new Image();
			image.addEventListener( 'load', onload );
			image.src = src;

		} else {

			return;

		}

		this._images.splice( order, 0, image );

	}

	remove( order: number ) {

		if ( this.length === 1 ) return;

		this._images.splice( order, 1 );

	}

	replace( images: Images ) {

		const length = this.length;

		images.forEach( ( image ) => this.insert( image, this.length ) );

		for ( let i = 0; i < length; i ++ ) {

			this.remove( 0 );

		}

		this._hasUpdated = true;
		this.to( 0 );

	}

	setEffect( effectName: string ) {

		const shader = getShader( effectName );
		const FSSource = FRAGMENT_SHADER_SOURCE_HEAD + shader.source + FRAGMENT_SHADER_SOURCE_FOOT;
		const uniforms = shader.uniforms;

		if ( this._program ) {

			this._gl.deleteTexture( this._from.texture );
			this._gl.deleteTexture( this._to.texture );
			this._gl.deleteShader( this._fragmentShader );
			this._gl.deleteProgram( this._program );

			this._extraTextures.forEach( ( texture ) => this._gl.deleteTexture( texture ) );
			this._extraTextures.length = 0;

		}

		this._fragmentShader = this._gl.createShader( this._gl.FRAGMENT_SHADER )!;
		this._gl.shaderSource( this._fragmentShader, FSSource );
		this._gl.compileShader( this._fragmentShader );

		this._program = this._gl.createProgram()!;
		this._gl.attachShader( this._program, this._vertexShader );
		this._gl.attachShader( this._program, this._fragmentShader );
		this._gl.linkProgram( this._program );
		this._gl.useProgram( this._program );

		// vertexes
		this._gl.bindBuffer( this._gl.ARRAY_BUFFER, this._vertexBuffer );
		this._gl.bufferData( this._gl.ARRAY_BUFFER, this._vertexes, this._gl.STATIC_DRAW );

		const position = this._gl.getAttribLocation( this._program, 'position' );
		this._gl.vertexAttribPointer( position, 2, this._gl.FLOAT, false, 0, 0 );
		this._gl.enableVertexAttribArray( position );

		// uv attr
		this._gl.bindBuffer( this._gl.ARRAY_BUFFER, this._uvBuffer );
		this._gl.bufferData( this._gl.ARRAY_BUFFER, UV, this._gl.STATIC_DRAW );

		const uv = this._gl.getAttribLocation( this._program, 'uv' );
		this._gl.vertexAttribPointer( uv, 2, this._gl.FLOAT, false, 0, 0 );
		this._gl.enableVertexAttribArray( uv );

		this._uniformLocations = {
			progress   : this._gl.getUniformLocation( this._program, 'progress' ),
			resolution : this._gl.getUniformLocation( this._program, 'resolution' ),
			from       : this._gl.getUniformLocation( this._program, 'from' ),
			to         : this._gl.getUniformLocation( this._program, 'to' ),
		};

		for ( const i in uniforms ) {

			this._uniformLocations[ i ] = this._gl.getUniformLocation( this._program, i );
			this._setUniform( i, uniforms[ i ] );

		}


		this._gl.activeTexture( this._gl.TEXTURE0 );
		this._from = new Texture( this._images[ this._currentIndex ], this._gl );

		this._gl.activeTexture( this._gl.TEXTURE1 );
		this._to   = new Texture( this._images[ this.nextIndex     ], this._gl );

		this._from.addEventListener( 'updated', this._updateTexture.bind( this ) );
		this._to.addEventListener( 'updated', this._updateTexture.bind( this ) );

		this._progress = 0;
		this.setSize( this._resolution[ 0 ], this._resolution[ 1 ] );
		this._updateTexture();

	}

	updateImageAspect( imageAspect?: number ) {

		this._imageAspect = imageAspect || this._resolution[ 0 ] / this._resolution[ 1 ];

		// update vertex buffer
		this._updateAspect();
		this._hasUpdated = true;

	}

	setSize( w: number, h: number ) {

		if ( this._domElement.width  === w && this._domElement.height === h ) return;

		this._domElement.width  = w;
		this._domElement.height = h;
		this._resolution[ 0 ] = w;
		this._resolution[ 1 ] = h;
		this._gl.viewport( 0, 0, w, h );
		this._gl.uniform2fv( this._uniformLocations.resolution, this._resolution );

		// update vertex buffer
		this._updateAspect();
		this._hasUpdated = true;

	}

	render() {

		if ( this._destroyed ) return;

		if ( this._inTransition ) {

			const transitionElapsedTime = Date.now() - this._transitionStartTime;
			this._progress = this._inTransition ? Math.min( transitionElapsedTime / this.duration, 1 ) : 0;

			// this._gl.clearColor( 0, 0, 0, 1 );
			this._gl.uniform1f( this._uniformLocations.progress, this._progress );
			this._gl.clear( this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT );
			this._gl.drawArrays( this._gl.TRIANGLES, 0, 6 );
			this._gl.flush();

			if ( this._progress === 1 ) {

				this._inTransition = false; // may move to tick()
				this._hasUpdated = false;
				this.dispatchEvent( { type: 'transitionEnd' } );
				// transitionEnd!

			}

		} else {

			// this._gl.clearColor( 0, 0, 0, 1 );
			this._gl.uniform1f( this._uniformLocations.progress, this._progress );
			this._gl.clear( this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT );
			this._gl.drawArrays( this._gl.TRIANGLES, 0, 6 );
			this._gl.flush();
			this._hasUpdated = false;

		}

	}

	destroy() {

		this._destroyed   = true;
		this._isRunning   = false;
		this._inTransition = false;

		this.setSize( 1, 1 );

		if ( this._program ) {

			// https://stackoverflow.com/a/23606581/1512272
			this._gl.activeTexture( this._gl.TEXTURE0 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.activeTexture( this._gl.TEXTURE1 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.activeTexture( this._gl.TEXTURE2 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.activeTexture( this._gl.TEXTURE3 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.activeTexture( this._gl.TEXTURE4 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.activeTexture( this._gl.TEXTURE5 );
			this._gl.bindTexture( this._gl.TEXTURE_2D, null );
			this._gl.bindBuffer( this._gl.ARRAY_BUFFER, null );
			// this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );
			// this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );
			// this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

			this._gl.deleteTexture( this._from.texture );
			this._gl.deleteTexture( this._to.texture );
			this._extraTextures.forEach( ( texture ) => this._gl.deleteTexture( texture ) );
			this._extraTextures.length = 0;
			this._gl.deleteBuffer( this._vertexBuffer );
			this._gl.deleteBuffer( this._uvBuffer );
			// this.context.deleteRenderbuffer( ... );
			// this.context.deleteFramebuffer( ... );
			this._gl.deleteShader( this._vertexShader );
			this._gl.deleteShader( this._fragmentShader );
			this._gl.deleteProgram( this._program );

		}

		if ( !! this._domElement.parentNode ) {

			this._domElement.parentNode.removeChild( this._domElement );

		}

	}

	private _setUniform( key: string, value: number | number[] | HTMLImageElement ) {

		if ( ! this._program ) return;

		const uniformLocation = this._gl.getUniformLocation( this._program, key );

		if ( typeof value === 'number' ) {

			// float
			this._gl.uniform1f( uniformLocation, value );

		} else if ( Array.isArray( value ) && value.length === 2 ) {

			// vec2
			this._gl.uniform2f( uniformLocation, value[ 0 ], value[ 1 ] );

		} else if ( Array.isArray( value ) && value.length === 3 ) {

			// vec3
			this._gl.uniform3f( uniformLocation, value[ 0 ], value[ 1 ], value[ 2 ] );

		} else if ( Array.isArray( value ) && value.length === 4 ) {

			// vec4
			this._gl.uniform4f( uniformLocation, value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ] );

		} else if ( value instanceof HTMLImageElement ) {

			// 0 and 1 are occupied. start from 2.
			const textureUnit =
				this._extraTextures.length === 0 ? this._gl.TEXTURE2:
				this._extraTextures.length === 1 ? this._gl.TEXTURE3:
				this._extraTextures.length === 2 ? this._gl.TEXTURE4:
				this._extraTextures.length === 3 ? this._gl.TEXTURE5:
				null;

			if ( ! textureUnit ) return;

			this._gl.activeTexture( textureUnit );
			const texture = new Texture( value, this._gl );
			this._gl.bindTexture( this._gl.TEXTURE_2D, texture.texture );
			this._extraTextures.push( texture );
			this._gl.uniform1i( uniformLocation, 1 + this._extraTextures.length ); // start from 2

		}

	}

	private _updateTexture() {

		this._gl.activeTexture( this._gl.TEXTURE0 );
		this._gl.bindTexture( this._gl.TEXTURE_2D, this._from.texture );
		this._gl.uniform1i( this._uniformLocations.from, 0 );

		this._gl.activeTexture( this._gl.TEXTURE1 );
		this._gl.bindTexture( this._gl.TEXTURE_2D, this._to.texture );
		this._gl.uniform1i( this._uniformLocations.to, 1 );

		this._hasUpdated = true;

	}

	private _updateAspect() {

		// update vertex buffer
		const canvasAspect = this._resolution[ 0 ] / this._resolution[ 1 ];
		const aspect = this._imageAspect / canvasAspect;
		const posX = aspect < 1 ? 1.0 : aspect;
		const posY = aspect > 1 ? 1.0 : canvasAspect / this._imageAspect;

		this._vertexes[  0 ] = - posX; this._vertexes[  1 ] = - posY;
		this._vertexes[  2 ] =   posX; this._vertexes[  3 ] = - posY;
		this._vertexes[  4 ] = - posX; this._vertexes[  5 ] =   posY;
		this._vertexes[  6 ] =   posX; this._vertexes[  7 ] = - posY;
		this._vertexes[  8 ] =   posX; this._vertexes[  9 ] =   posY;
		this._vertexes[ 10 ] = - posX; this._vertexes[ 11 ] =   posY;

		this._gl.bindBuffer( this._gl.ARRAY_BUFFER, this._vertexBuffer );
		this._gl.bufferData( this._gl.ARRAY_BUFFER, this._vertexes, this._gl.STATIC_DRAW );

	}

}
