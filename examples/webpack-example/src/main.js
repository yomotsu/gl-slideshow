import GLSlideshow from '../../../dist/GLSlideshow.module.js';

const container = document.getElementById( 'slideshow-placeholder' );
const slideshow = GLSlideshow.autoDetectRenderer(
	[ './img/1.jpg', './img/2.jpg' ]
);
updateSize();
container.appendChild( slideshow.domElement );
window.addEventListener( 'resize', updateSize );

function updateSize () {

	var width  = container.clientWidth;
	var height = width * 9 / 16;
	slideshow.setSize( width, height );

}
