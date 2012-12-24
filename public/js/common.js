// Require.js allows us to configure shortcut alias
requirejs.config({
    baseUrl: 'js/vendor',
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		'jquery-ui': {
			deps: ['jquery']
		},
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
        'icanhaz': {
            deps: ['jquery'],
            exports: 'ich'
        },
        'jquery.terminal': {
            deps: ['jquery', 'jquery.mousewheel'],
            exports: 'jQuery.fn.terminal'
        },
        'jquery.dataTables': {
            deps: ['jquery'],
            exports: 'jQuery.fn.dataTable'
        },
        'jquery.purr': {
            deps: ['jquery'],
            exports: 'jQuery.fn.purr'
        }
	},
	paths: {
		collections: '../collections',
		models: '../models',
		routers: '../routers',
		views: '../views',
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
		'underscore': 'lodash-1.0.0-rc.2.min',
		'backbone': 'backbone-0.9.9.min',
		'icanhaz': 'ICanHaz',
		'jquery.terminal': 'jquery.terminal-0.4.22',
		'jquery.mousewheel': 'jquery.mousewheel-min'
	}
});

/**
 * This require block initializes core apps/views that are common to most
 * pages.  It also has the side effect of loading the critical libraries
 * from local files, if the CDN has failed.
 */
require(['jquery',
         'backbone',
         'views/consoleAppView',
         'routers/router',
         'jquery-ui',
         ], function ($, Backbone, CommandLineView, Workspace) {
	// Within this scope, jquery and jquery UI have been loaded.

	// Initialize routing and start Backbone.history()
	new Workspace();
	Backbone.history.start();

	// Initialize the command line, since that's global to all pages.
	new CommandLineView();

}, function (err) {
    //The errback, error callback
    //The error has a list of modules that failed
    var failedId = err.requireModules && err.requireModules[0];
    if (failedId === 'jquery') {
        // undef is function only on the global requirejs object.
        // Use it to clear internal knowledge of jQuery. Any modules
        // that were dependent on jQuery and in the middle of loading
        // will not be loaded yet, they will wait until a valid jQuery
        // does load.
        requirejs.undef(failedId);

        // Set the path to jQuery to local path
        requirejs.config({
            paths: {
                jquery: '../vendor/jquery-1.8.3.min'
            }
        });

        // Try again. Note that the above require callback
        // with the "Do something with $ here" comment will
        // be called if this new attempt to load jQuery succeeds.
        require(['jquery'], function () {});
    } if (failedId === 'jquery-ui') {
        requirejs.undef(failedId);
        requirejs.config({
            paths: {
                'jquery-ui': '../vendor/jquery-ui-1.8.17.custom.min'
            }
        });
        require(['jquery-ui'], function () {});
    } else {
        //Some other error. Maybe show message to the user.
    }
});

define([], function() {
	return {
		// Which filter are we using?
		InstanceFilter: '', // empty, active, completed

		// What is the enter key constant?
		ENTER_KEY: 13
	};
});
