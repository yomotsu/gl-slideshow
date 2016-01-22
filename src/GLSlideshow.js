import WebGLRenderer   from './WebGLRenderer.js';
import CanvasRenderer  from './CanvasRenderer.js';
import shaderLib       from './shaderLib.js';

var GLSlideshow = {

	hasCanvas: function () {

		var canvas = document.createElement( 'canvas' );
		return !!( canvas.getContext && canvas.getContext( '2d' ) );

	}(),

	hasWebGL: function () {

		try{

			var canvas = document.createElement( 'canvas' );
			return !! window.WebGLRenderingContext && !! (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' )

			);

		} catch ( e ) {

			return false;

		}

	}(),

	audoDetectRenderer: function ( images, params ) {

		if ( !this.hasCanvas ) {

			// your browser is not available both canvas and webgl
			return;

		}

		if ( !this.hasWebGL ) {

			return new CanvasRenderer( images, params );

		}

		return new WebGLRenderer( images, params );

	},

	WebGLRenderer: WebGLRenderer,
	CanvasRenderer: CanvasRenderer,
	shaderLib: shaderLib

}

export default GLSlideshow;
