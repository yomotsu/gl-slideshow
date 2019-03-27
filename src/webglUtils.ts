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
