/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
// Configure defaults for require.js

requirejs.config({
    baseUrl: 'js/vendor',
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
        'backbone.queryparams': {
            deps: [
               'backbone'
            ]
        },
        'backbone.stickit': {
            deps: [
               'backbone',
               'underscore',
               'jquery'
            ]
        },
        'backbone-validation': {
            deps: [
               'backbone',
               'jquery'
            ]
        },
        'base64': {
            exports: 'Base64'
        },
        'dataTables.fnReloadAjax': {
            deps: ['jquery.dataTables'],
            exports: 'fnReloadAjax'
        },
        'FeedEk': {
            deps: ['jquery']
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
        'jquery.form': {
            deps: ['jquery']
        },
        'jquery.list': {
            deps: ['jquery']
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
            deps: ['jquery', 'jquery.cookie'],
            exports: 'jQuery.fn.jstree'
        },
        'jquery-ui.selectmenu': {
            deps: ['jquery', 'jquery-ui'],
            exports: 'jQuery.fn.selectmenu'
        },
        'morris': {
            deps: ['jquery', 'raphael'],
            exports: 'Morris'
        },
        'messenger': {
            exports: 'Messenger'
        },
        'raphael': {
            deps: ['jquery'],
            exports: 'Raphael'
        },
        'spinner': {
            exports: 'Spinner'
        },
        'URIjs': {

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
        wrappers: '../../wrappers',
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.0/lodash.min',
        'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
        'backbone.stickit': 'backbone.stickit.min',
        'backbone-validation': 'backbone-validation.min',
        'icanhaz': 'ICanHaz',
        'jquery.form': 'jquery.form',
        //'jquery.list': 'jquery.list.min',
        'jquery.terminal': 'jquery.terminal-0.4.22',
        'jquery.mousewheel': 'jquery.mousewheel-min',
        'messenger': 'messenger.min',
        //'jquery.jstree': '//cachedcommons.org/cache/jquery-jstree/1.0.0/javascripts/jquery-jstree-min',
        'raphael': 'raphael-min',
        'spinner': 'spin.min',
         URIjs: 'uri/src',
        'bootstrap': '//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min'
    }
});

var URL_ARGS = URL_ARGS || '';

requirejs.config({
    urlArgs: URL_ARGS
});

/**
 * This require block requires the core apps loaded by CDN, and fails back to
 * a local copy if not available (e.g. working disconnected).
 */
require(
        ['jquery',
         'underscore',
         'backbone',
         'icanhaz',
         'jquery-ui'
         ], function ($, _, Backbone, ich) {
}, function (err) {
    //The errback, error callback
    //The error has a list of modules that failed
    for (var i = 0; err.requireModules && i < err.requireModules.length; i++) {
        var failedId = err.requireModules[i];
        if (failedId === 'jquery') {
            // undef is function only on the global requirejs object.
            // Use it to clear internal knowledge of jQuery. Any modules
            // that were dependent on jQuery and in the middle of loading
            // will not be loaded yet, they will wait until a valid jQuery
            // does load.
            requirejs.undef(failedId);

            // Set the path to jQuery to local path
            console.log("Redirecting to local path.");
            requirejs.config({
                paths: {
                    jquery: '../vendor/jquery-1.8.3.min'
                }
            });

            // Try again. Note that the above require callback
            // with the "Do something with $ here" comment will
            // be called if this new attempt to load jQuery succeeds.
            require(['jquery'], function () {});
        } else if (failedId === 'jquery-ui') {
            requirejs.undef(failedId);
            console.log("Redirecting to local path:" + failedId);
            requirejs.config({
                paths: {
                    'jquery-ui': '../vendor/jquery-ui-1.9.2.min'
                }
            });
            require(['jquery-ui'], function () {console.log("Got it now.")});
        } else if (failedId === 'underscore') {
            requirejs.undef(failedId);
            requirejs.config({
                paths: {
                    'underscore': 'lodash-1.1.1.min'
                }
            });
            require(['underscore'], function () {});
        } else if (failedId === 'icanhaz') {
            //requirejs.undef(failedId);
            requirejs.config({
                paths: {
                    'icanhaz': 'ICanHaz'
                }
            });
            require(['icanhaz'], function () {});
        } else if (failedId === 'backbone') {
            requirejs.undef(failedId);
            requirejs.config({
                paths: {
                    'backbone': 'backbone-1.0.min'
                }
            });
            require(['backbone'], function () {});
        } else {
            console.log("Unhandled require failure:" +failedId);
        }
    }
});


/**
 * This require block initializes core apps/views that are common to most
 * pages.
 */
define(
        ['jquery',
         'underscore',
         'backbone',
         'views/consoleAppView',
         'routers/router',
         'views/errorDialog',
         'jquery-ui',
         'jquery-ui-plugins',
         'backbone.stickit'
         ], function ($, _, Backbone, CommandLineView, Router, ErrorDialog) {

    // Added custom handler for selectmenu
    Backbone.Stickit.addHandler({
        selector: 'select',
        initialize: function($el, model, options) {
            if($el.is("select[multiple]"))
            {
                $el.multiselect({
                    selectedList: options.selectedList,
                    noneSelectedText: options.noneSelectedText
                }).multiselectfilter();
            }else{
                $el.selectmenu();
            }
        }
    });

    // Within this scope, jquery and jquery UI have been loaded.

    // Initialize routing
    router = new Router();

    /** http://backbonejs.org/#Sync-emulateHTTP */
    //Backbone.emulateHTTP = true;

    //Base url for API calls
    var apiUrl;

    // Automatically choose URL based on current hostname.
    // TODO: need a cleaner solution for this, w/o requiring too much config
    if(location.hostname.indexOf("stackstudio2.appspot.com") !== -1 ) {
       apiUrl = "http://cloudmux-demo.sdlc.transcendcomputing.com:9292";
    }else if(location.hostname === "localhost") {
        apiUrl = "http://localhost:9292";
    }else if(location.hostname === "stackstudio-dev") {
        apiUrl = "http://devessex.essex.momentumsoftware.com:8000";
    }else if(location.hostname === "stackstudio-local") {
        apiUrl = "http://stackstudio-api:9292";
    }else if(location.hostname === "devessex.essex.momentumsoftware.com") {
        apiUrl = "http://devessex.essex.momentumsoftware.com:8000";
    }

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

        // The base API url
        apiUrl: apiUrl,

        // The global variable to handle custom events
        vent: vent,

        backbone: Backbone,

        previousView: {},

        errorDialog: function(title, message) {
            new ErrorDialog({title: title, message: message});
        },

        // Function tracks previous state
        setPreviousState: function( view ) {
            this.previousView = view;
            this.previousState = document.location.hash;
        },

        unloadPreviousState: function() {
            if(!$.isEmptyObject(this.previousView))
            {
                this.previousView.close();
            }
        },

        gotoPreviousState: function() {
            router.navigate(this.previousState, {trigger: true});
        }
    };
});
