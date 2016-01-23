import Renderer from './Renderer.js';
import Texture  from './Texture.js';

/**
 * Canvas Renderer class.
 * @class CanvasRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 */

export default class CanvasRenderer extends Renderer {

	constructor ( images, params ) {

		super( images, params );

		var that = this;

		this.from = new Texture( this.images[ this.count ] );
		this.to   = new Texture( this.images[ this.getNext() ] );
		
		this.from.addEventListener( 'updated', this.updateTexture.bind( this ) );
		this.to.addEventListener  ( 'updated', this.updateTexture.bind( this ) );

		this.setSize(
			params.width  || this.domElement.width,
			params.height || this.domElement.height
		)
		this.tick();

	}

	updateTexture () {

		this.isUpdated = true;

	}

	render () {

		var transitionElapsedTime = 0;
		var progress = 1;
		var width  = this.domElement.width;
		var height = this.domElement.height

		if ( this.inTranstion ) {

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min( transitionElapsedTime / this.duration, 1 ) : 0;

			if ( progress !== 1 ) {

			this.context2d.drawImage( this.from.image, 0, 0, width, height );
			this.context2d.globalAlpha = progress;
			this.context2d.drawImage( this.to.image, 0, 0, width, height );
			this.context2d.globalAlpha = 1;

			} else {

				this.context2d.drawImage( this.to.image, 0, 0, width, height );
				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				// transitionEnd!

			}

		} else {

			this.context2d.drawImage( this.images[ this.count ], 0, 0, width, height );
			this.isUpdated = false;

		}

	}

	dispose () {

		this.isRunning   = false;
		this.inTranstion = false;

		this.tick = function () {}

		this.setSize( 1, 1 );

		if ( !!this.domElement.parentNode ) {

			this.domElement.parentNode.removeChild( this.domElement );

		}

		delete this.from;
		delete this.to;
		delete this.domElement;

	}

}
