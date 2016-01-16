import Renderer     from './Renderer.js';

/**
 * Canvas Renderer class.
 * @class CanvasSlideshow
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.shader
 */

export default class CanvasSlideshow extends Renderer {

	constructor ( images, params ) {

		super( images, params );

		// TODO
		// fallback for old IE and webgl disabled browsers
	
	}

}
