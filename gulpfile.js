'use strict';

var browserSync = require( 'browser-sync' ).create();
var reload      = browserSync.reload;

var gulp        = require( 'gulp' );
var browserify  = require( 'browserify' );
var babelify    = require( 'babelify' );
var source      = require( 'vinyl-source-stream' );

var concat      = require( 'gulp-concat' );
var plumber     = require( 'gulp-plumber' );
var rename      = require( 'gulp-rename' );
var uglify      = require( 'gulp-uglify' );
var watch       = require( 'gulp-watch' );
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
    presets: [ 'es2015' ],
    plugins: [ 'add-module-exports' ]
  } ) )
  .bundle()
  .on( 'error', function( err ) {

    console.log( 'Error : ' + err.message );

  } )
  .pipe( source( 'GLSlideshow.js' ) )
  .pipe( gulp.dest( './build/' ) )

} );


gulp.task( 'pack', function () {

  return gulp.src( [
    'src/_header.js',
    'build/GLSlideshow.js'
  ] )
  .pipe( plumber() )
  .pipe( concat( 'GLSlideshow.js' ) )
  .pipe( gulp.dest( './build/' ) )
  .pipe( uglify( { preserveComments: 'some' } ) )
  .pipe( rename( { extname: '.min.js' } ) )
  .pipe( gulp.dest( './build/' ) );

} );


gulp.task( 'watch', function () {

  watch( [ './src/*.js' ], function () {
    runSequence( 'browserify', 'pack', browserSync.reload );
  } );

} );

gulp.task( 'default', function ( callback ) {

  return runSequence( 'browser-sync', 'browserify', 'pack', 'watch', callback );

} );
