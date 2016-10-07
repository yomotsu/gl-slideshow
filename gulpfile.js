'use strict';

var browserSync = require( 'browser-sync' ).create();
var reload      = browserSync.reload;

var browserify  = require( 'browserify' );
var babelify    = require( 'babelify' );
var source      = require( 'vinyl-source-stream' );

var gulp        = require( 'gulp' );
var addSrc      = require( 'gulp-add-src' );
var concat      = require( 'gulp-concat' );
var plumber     = require( 'gulp-plumber' );
var rename      = require( 'gulp-rename' );
var streamify   = require( 'gulp-streamify' );
var uglify      = require( 'gulp-uglify' );
var runSequence = require( 'run-sequence' ).use( gulp );


gulp.task( 'browser-sync', function () {

  browserSync.init( {
    server: {
      baseDir: './',
      directory: true
    },
    startPath: './examples/'
  } );

} );


gulp.task( 'browserify', function () {

  return browserify( {
    entries: './src/GLSlideshow.js',
    standalone: 'GLSlideshow'
  } )
  .transform( babelify.configure( {
    presets: [ [ 'es2015', { 'loose' : true} ] ],
    plugins: [
      'add-module-exports',
      // for IE9
      // see https://gist.github.com/zertosh/4f818163e4d68d58c0fa
      'transform-proto-to-assign'
    ]
  } ) )
  .bundle()
  .on( 'error', function( err ) {

    console.log( 'Error : ' + err.message );

  } )
  .pipe( source( 'GLSlideshow.js' ) )
  .pipe( addSrc.prepend( 'src/_header.js' ) )
  .pipe( streamify( concat( 'GLSlideshow.js' ) ) )
  .pipe( gulp.dest( './build/' ) )
  .pipe( uglify( { preserveComments: 'some' } ) )
  .pipe( rename( { extname: '.min.js' } ) )
  .pipe( gulp.dest( './build/' ) )

} );


gulp.task( 'watch', function () {

  gulp.watch( [ './src/*.js' ], function () {
    runSequence( 'browserify', browserSync.reload );
  } );

} );


gulp.task( 'default', function ( callback ) {

  return runSequence( 'browser-sync', 'browserify', 'watch', callback );

} );
