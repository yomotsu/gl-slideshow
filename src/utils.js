export default {

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

	}()

}
