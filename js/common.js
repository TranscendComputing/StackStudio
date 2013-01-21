/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
// Configure defaults for require.js
var URL_ARGS = URL_ARGS || '';

requirejs.config({
    baseUrl: 'js/vendor',
    urlArgs: URL_ARGS,
    nodeRequire: require,
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
		'base64': {
		    exports: 'Base64'
		},
		'github': {
		    deps: ['base64', 'underscore'],
		    exports: 'Github'
		},
		'gh3': {
		    deps: ['underscore', 'jquery'],
		    exports: 'Gh3'
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
        },
        'jquery.mousewheel': {
            deps: ['jquery'],
            exports: 'jQuery.fn.mousewheel'
        },
        'jquery.jstree': {
           deps: ['jquery'] 
        },
        'wijutil': {
            deps: ['jquery-ui', 'jquery.mousewheel']  
        },
        'wijsuperpanel': {
            deps: ['wijutil']  
        },
        'wijlist': {
            deps: ['wijutil', 'wijsuperpanel']
        },
        'wijsplitter': {
            deps: ['wijutil']  
        },
        'wijmo': {
        	deps: ['jquery-ui', 'jquery.mousewheel']
        }
	},
	packages: [
        'ace', {
            name: 'ace',
            main: 'ace',
            location: 'ace'
        },
        'JSV', {
            name: 'JSV',
            main: 'jsv',
            location: 'JSV/lib'
        }
	],
	paths: {
		collections: '../collections',
		models: '../models',
		routers: '../routers',
		views: '../views',
		interpreters: '../interpreters',
		templates: '../../templates',
		'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
		'underscore': 'lodash',
		'backbone': 'backbone-0.9.9',
		'icanhaz': 'ICanHaz',
		'jquery.terminal': 'jquery.terminal-0.4.22',
		'jquery.mousewheel': 'jquery.mousewheel-min',
		'wijlist': 'jquery.wijmo.wijlist',
		'wijutil': 'jquery.wijmo.wijutil',
		'wijsuperpanel': 'jquery.wijmo.wijsuperpanel',
		'wijsplitter': 'jquery.wijmo.wijsplitter',
		'wijmo': 'jquery.wijmo-open.all.2.3.2.min'
	}
});

/**
 * This require block initializes core apps/views that are common to most
 * pages.  It also has the side effect of loading the critical libraries
 * from local files, if the CDN has failed.
 */
define(
		['jquery',
		 'underscore',
         'backbone',
         'views/consoleAppView',
         'routers/router',
         'jquery-ui'
         ], function ($, _, Backbone, CommandLineView, Router) {
	// Within this scope, jquery and jquery UI have been loaded.

	// Initialize routing
	router = new Router();
	
	// Initialize custom events object
	var vent = _.extend({}, Backbone.Events);    
    
	// Initialize the command line, since that's global to all pages.
	new CommandLineView();

	// Return some "globals".
	return {
		// Which filter are we using?
		InstanceFilter: '', // empty, active, completed

		// What is the enter key constant?
		ENTER_KEY: 13,

		// The common router
		router: router,
		
		// The global variable to handle custom events
		vent: vent, 
		
		backbone: Backbone,
		
	    // Function tracks previous state
        setPreviousState: function( view ) {
            this.previousView = view
            this.previousState = document.location.hash;  
        },
        
        gotoPreviousState: function() {
            router.navigate(this.previousState, {trigger: true});
        }
	};
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

