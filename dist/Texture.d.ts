import { EventDispatcher } from './EventDispatcher';
export declare class Texture extends EventDispatcher {
    image: HTMLImageElement;
    gl: WebGLRenderingContext;
    texture: WebGLTexture;
    constructor(image: HTMLImageElement, gl: WebGLRenderingContext);
    isLoaded(): boolean;
    onload(): void;
    setImage(image: HTMLImageElement): void;
}
