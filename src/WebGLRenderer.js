import Renderer from './Renderer.js';
import Texture  from './Texture.js';

var vertexShaderSource = `
attribute vec2 position;
void main () { gl_Position = vec4( position, 1., 1. ); }
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

	constructor ( images, params ) {

		super( images, params );

		var that = this;

		this.glCanvas = document.createElement( 'canvas' );
		this.gl = this.glCanvas.getContext( 'webgl' ) ||
		          this.glCanvas.getContext( 'experimental-webgl' );
		this.resolution = new Float32Array( [
			params && params.width  || this.domElement.width,
			params && params.height || this.domElement.height
		] );

		this.vertexShader = this.gl.createShader( this.gl.VERTEX_SHADER );
		this.gl.shaderSource( this.vertexShader, vertexShaderSource );
		this.gl.compileShader( this.vertexShader );
		this.setEffect( params && params.effect || 'crossFade' );

		this.tick();

	}

	setEffect ( effectName, params ) {

		var i = 0;
		var position;
		var FSSource = GLSlideshow.shaderLib[ effectName ].source;
		var uniforms = GLSlideshow.shaderLib[ effectName ].uniforms;

		if ( this.program ) {

			this.gl.deleteTexture( this.from.texture );
			this.gl.deleteTexture( this.to.texture );
			this.gl.deleteBuffer( this.vertexBuffer );
			this.gl.deleteShader( this.fragmentShader );
			this.gl.deleteProgram( this.program );

		}

		this.fragmentShader = this.gl.createShader( this.gl.FRAGMENT_SHADER );
		this.gl.shaderSource( this.fragmentShader, FSSource );
		this.gl.compileShader( this.fragmentShader );

		this.program = this.gl.createProgram();
		this.gl.attachShader( this.program, this.vertexShader );
		this.gl.attachShader( this.program, this.fragmentShader );
		this.gl.linkProgram( this.program );
		this.gl.useProgram( this.program );

		this.vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
		this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( [
			- 1.0, - 1.0,
			  1.0, - 1.0,
			- 1.0,   1.0,
			  1.0, - 1.0,
			  1.0,   1.0,
			- 1.0,   1.0
		] ), this.gl.STATIC_DRAW );

		position = this.gl.getAttribLocation( this.program, 'position' );
		this.gl.vertexAttribPointer( position, 2, this.gl.FLOAT, false, 0, 0 );
		this.gl.enableVertexAttribArray( position );

		this.uniforms = {
			progress  : this.gl.getUniformLocation( this.program, 'progress' ),
			resolution: this.gl.getUniformLocation( this.program, 'resolution' ),
			from      : this.gl.getUniformLocation( this.program, 'from' ),
			to        : this.gl.getUniformLocation( this.program, 'to' )
		};

		for ( i in uniforms ) {

			this.uniforms[ i ] = this.gl.getUniformLocation( this.program, i );
			this.setUniform(
				i,
				uniforms[ i ].value,
				uniforms[ i ].type
			);

		}

		this.from = new Texture( this.images[ this.count     ], this.gl );
		this.to   = new Texture( this.images[ this.getNext() ], this.gl );

		this.from.addEventListener( 'updated', this.updateTexture.bind( this ) );
		this.to.addEventListener  ( 'updated', this.updateTexture.bind( this ) );

		this.setSize( this.resolution[ 0 ], this.resolution[ 1 ] );
		this.updateTexture();

	}

	setUniform ( key, value, type ) {

		// TODO
		var uniformLocation = this.gl.getUniformLocation( this.program, key );

		if ( type === 'float' ) {

			this.gl.uniform1f( uniformLocation, value );

		} else if ( type === 'vec2' ) {

			// this.gl.uniform2fv

		}

	}

	updateTexture () {

		this.gl.activeTexture( this.gl.TEXTURE0 );
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.from.texture );
		this.gl.uniform1i( this.uniforms.from, 0 );

		this.gl.activeTexture( this.gl.TEXTURE1 );
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.to.texture );
		this.gl.uniform1i( this.uniforms.to, 1 );

		this.isUpdated = true;

	}

	setSize ( w, h ) {

		super.setSize( w, h );

		this.glCanvas.width  = w;
		this.glCanvas.height = h;
		this.resolution[ 0 ] = w;
		this.resolution[ 1 ] = h;
		this.gl.viewport( 0, 0, w, h );
		this.gl.uniform2fv( this.uniforms.resolution, this.resolution );
		this.isUpdated = true;

	}

	render () {

		var transitionElapsedTime = 0;
		var progress = 1;

		if ( this.inTranstion ) {

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min( transitionElapsedTime / this.duration, 1 ) : 0;

			// this.gl.clearColor( 0, 0, 0, 1 );
			this.gl.uniform1f( this.uniforms.progress, progress );
			this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
			this.gl.drawArrays( this.gl.TRIANGLES, 0, 6 );
			this.gl.flush();
			this.context2d.drawImage( this.glCanvas, 0, 0 );

			if ( progress === 1 ) {

				this.context2d.drawImage( this.to.image, 0, 0, this.domElement.width, this.domElement.height );
				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				this.dispatchEvent( { type: 'transitionEnd' } );
				// transitionEnd!

			}

		} else {

			this.context2d.drawImage( this.images[ this.count ], 0, 0, this.domElement.width, this.domElement.height );
			this.isUpdated = false;

		}

	}

	dispose () {

		this.isRunning   = false;
		this.inTranstion = false;

		this.tick = function () {}

		if ( this.program ) {

			this.gl.activeTexture( this.gl.TEXTURE0 );
			this.gl.bindTexture( this.gl.TEXTURE_2D, null );
			this.gl.activeTexture( this.gl.TEXTURE1 );
			this.gl.bindTexture( this.gl.TEXTURE_2D, null );
			this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );
			// this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );
			// this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );
			// this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

			this.gl.deleteTexture( this.from.texture );
			this.gl.deleteTexture( this.to.texture );
			this.gl.deleteBuffer( this.vertexBuffer );
			// this.gl.deleteRenderbuffer( ... );
			// this.gl.deleteFramebuffer( ... );
			this.gl.deleteShader( this.vertexShader );
			this.gl.deleteShader( this.fragmentShader );
			this.gl.deleteProgram( this.program );

		}

		this.setSize( 1, 1 );

		if ( !!this.domElement.parentNode ) {

			this.domElement.parentNode.removeChild( this.domElement );

		}

		delete this.from;
		delete this.to;
		delete this.domElement;
		delete this.glCanvas;

	}

}
