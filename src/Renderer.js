import EventDispatcher from './EventDispatcher.js';

/**
 * Primitive Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} options
 * @param {Number} options.width
 * @param {Number} options.height
 */

export default class Renderer extends EventDispatcher {

	constructor( images, options ) {

		super();

		this.count = 0;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning   = true;
		this.inTranstion = false;
		this.duration = options && options.duration || 1000;
		this.interval = Math.max( options && options.interval || 5000, this.duration );
		this.isUpdated = true;
		this.domElement = options && options.canvas || document.createElement( 'canvas' );
		this.images = [];

		images.forEach( ( image, i ) => this.insert( image, i ) );

	}

	transition( to ) {

		this.from.setImage( this.images[ this.count ] );
		this.to.setImage( this.images[ to ] );

		this.transitionStartTime = Date.now();
		this.startTime = Date.now();
		this.count = to;
		this.inTranstion = true;
		this.isUpdated = true;
		this.dispatchEvent( { type: 'transitionStart' } );

	}

	setSize( w, h ) {

		if (
			this.domElement.width  === w &&
			this.domElement.height === h
		) {

			return;

		}

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

	tick() {

		if ( this.isRunning ) {

			this.elapsedTime = Date.now() - this.startTime;

		}

		if ( this.interval + this.duration < this.elapsedTime ) {

			this.transition( this.getNext() );
			// transition start

		}

		requestAnimationFrame( this.tick.bind( this ) );

		if ( this.isUpdated ) this.render();

	}

	render() {}

	play() {

		if ( this.isRunning ) return this;

		const pauseElapsedTime = Date.now() - this.pauseStartTime;
		this.startTime += pauseElapsedTime;
		this.isRunning = true;

		delete this._pauseStartTime;
		return this;

	}

	pause() {

		if ( ! this.isRunning ) return this;

		this.isRunning = false;
		this.pauseStartTime = Date.now();

		return this;

	}

	getCurrent() {

		return this.count;

	}

	getNext() {

		return ( this.count < this.images.length - 1 ) ? this.count + 1 : 0;

	}

	getPrev() {

		return ( this.count !== 0 ) ? this.count - 1 : this.images.length;

	}

	insert( image, order ) {

		const onload = ( event ) => {

			this.isUpdated = true;
			event.target.removeEventListener( 'load', onload );

		};

		if ( image instanceof Image ) {

			image.addEventListener( 'load', onload );

		} else if ( typeof image === 'string' ) {

			const src = image;
			image = new Image();
			image.addEventListener( 'load', onload );
			image.src = src;

		} else {

			return;

		}

		this.images.splice( order, 0, image );

	}

	remove( order ) {

		if ( this.images.length === 1 ) {

			return;

		}

		this.images.splice( order, 1 );

	}

	replace( images ) {

		var length = this.images.length;

		images.forEach( ( image ) => {

			this.insert( image, this.images.length );

		} );

		for ( let i = 0 | 0; i < length; i = ( i + 1 ) | 0 ) {

			this.remove( 0 );

		}

		this.isUpdated = true;
		this.transition( 0 );

	}

}
