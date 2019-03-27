export declare type ImageSource = string | HTMLImageElement;
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
