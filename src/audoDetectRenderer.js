import utils           from './utils.js';
import WebGLRenderer   from './WebGLRenderer.js';
import CanvasRenderer  from './CanvasRenderer.js';

export default function ( images, params ) {

	if ( !utils.hasCanvas ) {

		// your browser is not available both canvas and webgl
		return;

	}

	if ( !utils.hasWebGL ) {

		return new CanvasRenderer( images, params );

	}

	return new WebGLRenderer( images, params );

}
