
/**
 * Primitive Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.shader
 */

 export default class Renderer {

	constructor ( images, params ) {

		var that = this;

		this.count = 0;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning   = true;
		this.isAnimating = false;
		this.duration = params && params.duration || 1000;
		this.interval = Math.max( params && params.interval || 5000, this.duration );
		this.isUpdated = true;
		this.domElement = document.createElement( 'canvas' );
		this.images = [];

		images.forEach( function ( image, i ) { that.insert( image, i ); } );

	}

	transition ( to ) {

		this.from.setImage( this.images[ this.count ] );
		this.to.setImage( this.images[ to ] );

		this.transitionStartTime = Date.now();
		this.startTime = Date.now();
		this.count = to;
		this.isAnimating = true;
		this.isUpdated = true;

	}

	setSize ( w, h ) {

		this.domElement.width  = w;
		this.domElement.height = h;
		this.isUpdated = true;

	}

	// setEconomyMode ( state ) {

	// 	// TODO
	// 	// LINEAR_MIPMAP_LINEAR to low
	// 	// lowFPS
	// 	// and othres
	// 	this.isEconomyMode = state;

	// }

	tick () {

		var next = 0;

		if ( this.isRunning ) {

			this.elapsedTime = Date.now() - this.startTime;

		}

		if ( this.interval < this.elapsedTime ) {

			next = this.getNext();
			this.transition( next );

		}

		requestAnimationFrame( this.tick.bind( this ) );

		if ( this.isUpdated || this.isAnimating ) { this.render(); }

	}

	render () {}

	play () {

		var pauseElapsedTime = 0;

		if ( this.isRunning ) { return this; }

		pauseElapsedTime = Date.now() - this.pauseStartTime;
		this.startTime += pauseElapsedTime;
		this.isRunning = true;

		delete this._pauseStartTime;
		return this;

	}

	pause () {

		if ( !this.isRunning ) { return this; }

		this.isRunning = false;
		this.pauseStartTime = Date.now();

		return this;

	}

	getNext () {

		return ( this.count < this.images.length - 1 ) ? this.count + 1 : 0;

	}

	insert ( image, order ) {

		var src;

		if ( image instanceof Image ) {

			// nothing happens

		} else if ( typeof image === 'string' ) {

			src = image;
			image = new Image();
			image.src = src;

		} else {

			return;

		}

		this.images.splice( order, 0, image );

	}

	remove ( order ) {

		if ( this.images.length === 1 ) {

			return;

		}

		this.images.splice( order, 1 );

	}

}
