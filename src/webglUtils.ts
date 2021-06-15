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

export function ceilPowerOfTwo( value: number ): number {

	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

}
