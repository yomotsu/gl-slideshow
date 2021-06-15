interface ContextAttributes {
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: boolean;
}
export declare function getWebglContext(canvas: HTMLCanvasElement, contextAttributes?: ContextAttributes): WebGLRenderingContext;
export declare function ceilPowerOfTwo(value: number): number;
export {};
