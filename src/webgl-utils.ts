interface ContextAttributes {
	alpha?: boolean,
	depth?: boolean,
	stencil?: boolean,
	antialias?: boolean,
	premultipliedAlpha?: boolean,
	preserveDrawingBuffer?: boolean,
	powerPreference?: boolean,
};

export function getWebglContext( canvas: HTMLCanvasElement, contextAttributes?: ContextAttributes ): WebGLRenderingContext {

	return (
		canvas.getContext( 'webgl', contextAttributes ) ||
		canvas.getContext( 'experimental-webgl', contextAttributes )
	) as WebGLRenderingContext;

}

export const MAX_TEXTURE_SIZE = ( () => {

	const $canvas = document.createElement( 'canvas' );
	const gl = getWebglContext( $canvas );
	const MAX_TEXTURE_SIZE = gl.getParameter( gl.MAX_TEXTURE_SIZE ) as number;
	const ext = gl.getExtension( 'WEBGL_lose_context' );
	if ( ext ) ext.loseContext();

	return MAX_TEXTURE_SIZE;

} )();

export function ceilPowerOfTwo( value: number ): number {

	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

}

export function isPowerOfTwo( value: number ): boolean {

	return ( value & ( value - 1 ) ) === 0 && value !== 0;

}
