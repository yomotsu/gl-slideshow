import EventDispatcher from './EventDispatcher.js';

/**
 * Texture class.
 * @class Texture
 * @constructor
 * @param {Image} image HTMLImageElement
 */

export default class Texture {

	constructor ( image ) {

		this.image = new Image();
		this.setImage( image );
		this.onload = this.setImage.bind( this, this.image );

		return this;

	}

	setImage ( image ) {

		this.image.removeEventListener( this.onload );
		this.image = image;
		this.image.addEventListener( 'load', this.onload );
		this.dispatchEvent( { type: 'updated' } );

	}

}

EventDispatcher.prototype.apply( Texture.prototype );
