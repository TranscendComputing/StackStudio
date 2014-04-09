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
        'dataTables.bootstrap': {
            deps: ['jquery.dataTables']
        },
        'dataTables.fnReloadAjax': {
            deps: ['jquery.dataTables'],
            exports: 'fnReloadAjax'
        },
        'dataTables.fnProcessingIndicator': {
            deps: ['jquery.dataTables'],
            exports: 'fnProcessingIndicator'
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

        },
        'instructor': {
            deps: ['jquery', 'jquery-ui']
        }
    },
    paths: {
        collections: '../collections',
        models: '../models',
        routers: '../routers',
        views: '../views',
        interpreters: '../interpreters',
        templates: '../../templates',
        wrappers: '../../wrappers',
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.0/lodash.min',
        'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
        'backbone.stickit': 'backbone.stickit.min',
        'backbone-validation': 'backbone-validation.min',
        'icanhaz': 'ICanHaz',
        'jquery.form': '//cdnjs.cloudflare.com/ajax/libs/jquery.form/3.45/jquery.form',
        'jquery.terminal': 'jquery.terminal',
        'jquery.mousewheel': 'jquery.mousewheel-min',
        'jquery.multiselect': '//cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.min',
        'jquery.multiselect.filter': '//cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.filter.min',
        'jquery.jstree': '//cdn.jsdelivr.net/jquery.jstree/pre1.0/jquery.jstree',
        'messenger': 'messenger.min',
        'raphael': 'raphael-min',
        'spinner': 'spin.min',
         URIjs: 'URI',
        'bootstrap': '//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
        'typeahead': '../vendor/twitter/typeahead',
        'ace': '//cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace',
        'mode-json': '//cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/mode-json'
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
    [
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'jquery-ui'
    ],
    function ($, _, Backbone, ich) {

    },
    function (err) {
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
                        jquery: '../vendor/jquery'
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
                        'jquery-ui': '../vendor/jquery-ui'
                    }
                });
                require(['jquery-ui'], function () {console.log("Got it now.")});
            } else if (failedId === 'underscore') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'underscore': 'lodash'
                    }
                });
                require(['underscore'], function () {});
            } else if (failedId === 'icanhaz') {
                requirejs.undef(failedId);
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
                        'backbone': 'backbone'
                    }
                });
                require(['backbone'], function () {});
            } else if (failedId === 'jquery.jstree') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'jquery.jstree': 'jquery.jstree'
                    }
                });
                require(['jquery.jstree'], function () {});
            } else {
                console.log("Unhandled require failure:" +failedId);
            }
        }
    }
);


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
         'text!/backend.json',
         'jquery-ui',
         'jquery-ui-plugins',
         'backbone.stickit',
         'jquery.dataTables',
         'dataTables.bootstrap'
         ], function ($, _, Backbone, CommandLineView, Router, ErrorDialog, backendTxt) {

    // Added custom handler for select
    Backbone.Stickit.addHandler({
        selector: 'select',
        initialize: function($el, model, options) {
            if($el.is("select[multiple]"))
            {
                $el.multiselect({
                    selectedList: options.selectedList,
                    noneSelectedText: options.noneSelectedText
                }).multiselectfilter();
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
    apiUrl = JSON.parse(backendTxt).backend_endpoint;

    // Initialize custom events object
    var vent = _.extend({}, Backbone.Events);

    // Set up our icons
    var icons = {
      chef: "<img src='/images/CompanyLogos/chefLogo.jpg' class='chef_icon'/>",
      puppet: "<img src='/images/CompanyLogos/puppet.png' class='puppet_icon'/>",
      salt: "<img src='/images/CompanyLogos/saltLogo.jpg' class='salt_icon'/>",
      ansible: "<img src='/images/CompanyLogos/ansible.png' class='ansible_icon'/>",
      jenkins: "<img src='/images/CompanyLogos/jenkins.jpg' class='jenkins_icon'/>",
      git: "<img src='/images/CompanyLogos/gitIcon.png' class='git_icon'/>"
    };

    $(document).on('click', '.no-default', function ( e ) {
        e.preventDefault();
    });

    // Initialize the command line, since that's global to all pages.
    var consoleAppView = new CommandLineView();

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

        consoleAppView: consoleAppView,

        icons: icons,

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
