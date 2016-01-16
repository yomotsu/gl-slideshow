import EventDispatcher  from './EventDispatcher.js';
import WebGLRenderer    from './WebGLRenderer.js';
import shaderLib        from './shaderLib.js';

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

	WebGLRenderer: WebGLRenderer,
	shaderLib: shaderLib

}

export default GLSlideshow;
