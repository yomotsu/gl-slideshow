export interface Uniforms {
    [key: string]: number | number[];
}
interface ShaderSourceAndUniforms {
    uniforms: Uniforms;
    source: string;
}
export declare const VERTEX_SHADER_SOURCE = "\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUv;\nvoid main() {\n\tgl_Position = vec4( position, 1., 1. );\n\tvUv = uv;\n}\n";
export declare const FRAGMENT_SHADER_SOURCE_HEAD = "\nprecision highp float;\nvarying vec2 vUv;\nuniform float progress, ratio;\nuniform vec2 resolution;\nuniform sampler2D from, to;\nvec4 getFromColor( vec2 uv ) {\n\treturn texture2D(from, uv);\n}\nvec4 getToColor( vec2 uv ) {\n\treturn texture2D(to, uv);\n}\n";
export declare const FRAGMENT_SHADER_SOURCE_FOOT = "\nvoid main(){\n\tgl_FragColor = transition( vUv );\n}\n";
export declare function getShader(effectName: string): ShaderSourceAndUniforms;
export declare function addShader(effectName: string, source: string, uniforms: Uniforms): void;
export {};
