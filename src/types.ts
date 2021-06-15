export type TextureSource = HTMLImageElement | HTMLCanvasElement;
export type ImageSource = string | TextureSource;
export type Images = ImageSource[];

export interface GLSlideshowOptions {
	canvas?: HTMLCanvasElement;
	width?: number;
	height?: number;
	imageAspect?: number;
	duration?: number;
	interval?: number;
	effect?: string;
};
