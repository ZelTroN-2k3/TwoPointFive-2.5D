// THIS FILE IS DEPRECATED SEE README.

ig.module(
    'weltmeister.plugins.loader'
).requires(
    'weltmeister.weltmeister',
    // plugins here
    'weltmeister.plugins.entity-select', 
    'weltmeister.plugins.labeltoggle', 
    'weltmeister.plugins.save-extra', 
    'weltmeister.plugins.level-properties'
).defines( function ( ) {
    'use strict';

    var loader = new wm.Loader( wm.Weltmeister, ig.resources );
    loader.load( );

} );
