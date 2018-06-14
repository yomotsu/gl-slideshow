import Renderer from './Renderer.js';
import Texture  from './Texture.js';
import { getShader } from './shaderLib.js';

const vertexShaderSource = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main () {
	gl_Position = vec4( position, 1., 1. );
	vUv = uv;
}
`;

/**
 * WebGL Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.effect
 */

export default class WebGLRenderer extends Renderer {

	constructor( images, params = {} ) {

		super( images, params );

		this.context = this.domElement.getContext( 'webgl' ) ||
									 this.domElement.getContext( 'experimental-webgl' );

		this.resolution = new Float32Array( [
			params.width || this.domElement.width,
			params.height || this.domElement.height
		] );
		this.imageAspect = params.imageAspect || this.resolution[ 0 ] / this.resolution[ 1 ];

		this.vertexShader = this.context.createShader( this.context.VERTEX_SHADER );
		this.context.shaderSource( this.vertexShader, vertexShaderSource );
		this.context.compileShader( this.vertexShader );
		this.setEffect( params.effect || 'crossFade' );
		this.progress = 0;

		this.tick();

	}

	setEffect( effectName ) {

		const shader = getShader( effectName );
		const FSSource = shader.source;
		const uniforms = shader.uniforms;
		let i = 0;

		if ( this.program ) {

			this.context.deleteTexture( this.from.texture );
			this.context.deleteTexture( this.to.texture );
			this.context.deleteBuffer( this.vertexBuffer );
			this.context.deleteShader( this.fragmentShader );
			this.context.deleteProgram( this.program );

		}

		this.fragmentShader = this.context.createShader( this.context.FRAGMENT_SHADER );
		this.context.shaderSource( this.fragmentShader, FSSource );
		this.context.compileShader( this.fragmentShader );

		this.program = this.context.createProgram();
		this.context.attachShader( this.program, this.vertexShader );
		this.context.attachShader( this.program, this.fragmentShader );
		this.context.linkProgram( this.program );
		this.context.useProgram( this.program );

		const canvasAspect = this.resolution[ 0 ] / this.resolution[ 1 ];
		const aspect = this.imageAspect / canvasAspect;
		const posX = aspect < 1 ? 1.0 : aspect;
		const posY = aspect > 1 ? 1.0 : canvasAspect / this.imageAspect;

		this.vertexBuffer = this.context.createBuffer();
		this.context.bindBuffer( this.context.ARRAY_BUFFER, this.vertexBuffer );
		this.context.bufferData( this.context.ARRAY_BUFFER, new Float32Array( [
			- posX, - posY,
			  posX, - posY,
			- posX,   posY,
			  posX, - posY,
			  posX,   posY,
			- posX,   posY
		] ), this.context.STATIC_DRAW );

		const position = this.context.getAttribLocation( this.program, 'position' );
		this.context.vertexAttribPointer( position, 2, this.context.FLOAT, false, 0, 0 );
		this.context.enableVertexAttribArray( position );

		// uv attr
		this.uvBuffer = this.context.createBuffer();
		this.context.bindBuffer( this.context.ARRAY_BUFFER, this.uvBuffer );
		this.context.bufferData( this.context.ARRAY_BUFFER, new Float32Array( [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0
		] ), this.context.STATIC_DRAW );

		const uv = this.context.getAttribLocation( this.program, 'uv' );
		this.context.vertexAttribPointer( uv, 2, this.context.FLOAT, false, 0, 0 );
		this.context.enableVertexAttribArray( uv );

		this.uniforms = {
			progress   : this.context.getUniformLocation( this.program, 'progress' ),
			resolution : this.context.getUniformLocation( this.program, 'resolution' ),
			from       : this.context.getUniformLocation( this.program, 'from' ),
			to         : this.context.getUniformLocation( this.program, 'to' )
		};

		for ( i in uniforms ) {

			this.uniforms[ i ] = this.context.getUniformLocation( this.program, i );
			this.setUniform(
				i,
				uniforms[ i ].value,
				uniforms[ i ].type
			);

		}

		this.from = new Texture( this.images[ this.count     ], this.context );
		this.to   = new Texture( this.images[ this.getNext() ], this.context );

		this.from.addEventListener( 'updated', this.updateTexture.bind( this ) );
		this.to.addEventListener( 'updated', this.updateTexture.bind( this ) );

		this.progress = 0;
		this.setSize( this.resolution[ 0 ], this.resolution[ 1 ] );
		this.updateTexture();

	}

	setUniform( key, value, type ) {

		const uniformLocation = this.context.getUniformLocation( this.program, key );

		if ( type === 'float' ) {

			this.context.uniform1f( uniformLocation, value );

		} else if ( type === 'vec2' ) {

			this.context.uniform2f( uniformLocation, value[ 0 ], value[ 1 ] );

		} else if ( type === 'vec3' ) {

			this.context.uniform3f( uniformLocation, value[ 0 ], value[ 1 ], value[ 2 ] );

		} else if ( type === 'vec4' ) {

			this.context.uniform4f( uniformLocation, value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ] );

		}

	}

	updateTexture() {

		this.context.activeTexture( this.context.TEXTURE0 );
		this.context.bindTexture( this.context.TEXTURE_2D, this.from.texture );
		this.context.uniform1i( this.uniforms.from, 0 );

		this.context.activeTexture( this.context.TEXTURE1 );
		this.context.bindTexture( this.context.TEXTURE_2D, this.to.texture );
		this.context.uniform1i( this.uniforms.to, 1 );

		this.isUpdated = true;

	}

	setSize( w, h ) {

		super.setSize( w, h );

		this.domElement.width  = w;
		this.domElement.height = h;
		this.resolution[ 0 ] = w;
		this.resolution[ 1 ] = h;
		this.context.viewport( 0, 0, w, h );
		this.context.uniform2fv( this.uniforms.resolution, this.resolution );

		// update vertex buffer
		const canvasAspect = this.resolution[ 0 ] / this.resolution[ 1 ];
		const aspect = this.imageAspect / canvasAspect;
		const posX = aspect < 1 ? 1.0 : aspect;
		const posY = aspect > 1 ? 1.0 : canvasAspect / this.imageAspect;

		this.context.bindBuffer( this.context.ARRAY_BUFFER, this.vertexBuffer );
		this.context.bufferData( this.context.ARRAY_BUFFER, new Float32Array( [
			- posX, - posY,
			  posX, - posY,
			- posX,   posY,
			  posX, - posY,
			  posX,   posY,
			- posX,   posY
		] ), this.context.STATIC_DRAW );

		this.isUpdated = true;

	}

	render() {

		if ( this.inTranstion ) {

			const transitionElapsedTime = Date.now() - this.transitionStartTime;
			this.progress = this.inTranstion ? Math.min( transitionElapsedTime / this.duration, 1 ) : 0;

			// this.context.clearColor( 0, 0, 0, 1 );
			this.context.uniform1f( this.uniforms.progress, this.progress );
			this.context.clear( this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT );
			this.context.drawArrays( this.context.TRIANGLES, 0, 6 );
			this.context.flush();

			if ( this.progress === 1 ) {

				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				this.dispatchEvent( { type: 'transitionEnd' } );
				// transitionEnd!

			}

		} else {

			// this.context.clearColor( 0, 0, 0, 1 );
			this.context.uniform1f( this.uniforms.progress, this.progress );
			this.context.clear( this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT );
			this.context.drawArrays( this.context.TRIANGLES, 0, 6 );
			this.context.flush();
			this.isUpdated = false;

		}

	}

	dispose() {

		this.isRunning   = false;
		this.inTranstion = false;

		this.tick = () => {};
		this.setSize( 1, 1 );

		if ( this.program ) {

			this.context.activeTexture( this.context.TEXTURE0 );
			this.context.bindTexture( this.context.TEXTURE_2D, null );
			this.context.activeTexture( this.context.TEXTURE1 );
			this.context.bindTexture( this.context.TEXTURE_2D, null );
			this.context.bindBuffer( this.context.ARRAY_BUFFER, null );
			// this.context.bindBuffer( this.context.ELEMENT_ARRAY_BUFFER, null );
			// this.context.bindRenderbuffer( this.context.RENDERBUFFER, null );
			// this.context.bindFramebuffer( this.context.FRAMEBUFFER, null );

			this.context.deleteTexture( this.from.texture );
			this.context.deleteTexture( this.to.texture );
			this.context.deleteBuffer( this.vertexBuffer );
			// this.context.deleteRenderbuffer( ... );
			// this.context.deleteFramebuffer( ... );
			this.context.deleteShader( this.vertexShader );
			this.context.deleteShader( this.fragmentShader );
			this.context.deleteProgram( this.program );

		}

		if ( !! this.domElement.parentNode ) {

			this.domElement.parentNode.removeChild( this.domElement );

		}

		delete this.from;
		delete this.to;
		delete this.domElement;

	}

}
