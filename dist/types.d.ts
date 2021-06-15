export declare type TextureSource = HTMLImageElement | HTMLCanvasElement;
export declare type ImageSource = string | TextureSource;
export declare type Images = ImageSource[];
export interface GLSlideshowOptions {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    imageAspect?: number;
    duration?: number;
    interval?: number;
    effect?: string;
}
