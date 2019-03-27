export type ImageSource = string | HTMLImageElement;
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
