export default {

	hasCanvas: ( () => {

		const canvas = document.createElement( 'canvas' );
		return !! ( canvas.getContext && canvas.getContext( '2d' ) );

	} )(),

	hasWebGL: ( () => {

		try {

			const canvas = document.createElement( 'canvas' );
			return !! window.WebGLRenderingContext && !! (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' )

			);

		} catch ( e ) {

			return false;

		}

	} )()

};
