/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*

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
        'jquery-ui',
        'jquery.jstree'
    ],
    // XXX - Does this function need parameters? function() {}, should suffice?
    function ($, _, Backbone, ich) {},
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
                        jquery: 'js/vendor/jquery'
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
                        'jquery-ui': 'js/vendor/jquery-ui'
                    }
                });
                require(['jquery-ui'], function () {console.log("Got it now.")});
            } else if (failedId === 'underscore') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'underscore': 'js/vendor/lodash'
                    }
                });
                require(['underscore'], function () {});
            } else if (failedId === 'icanhaz') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'icanhaz': 'js/vendor/ICanHaz'
                    }
                });
                require(['icanhaz'], function () {});
            } else if (failedId === 'backbone') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'backbone': 'js/vendor/backbone'
                    }
                });
                require(['backbone'], function () {});
            } else if (failedId === 'jquery.jstree') {
                requirejs.undef(failedId);
                requirejs.config({
                    paths: {
                        'jquery.jstree': 'js/vendor/jquery.jstree'
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
    [
        'jquery',
        'underscore',
        'backbone',
        'views/consoleAppView',
        'routers/router',
        'views/errorDialog',
        'text!config/backend.json',
        'jquery-ui',
        'jquery-ui-plugins',
        'backbone.stickit',
        'jquery.dataTables',
        'dataTables.bootstrap'
    ],
    function ($, _, Backbone, CommandLineView, Router, ErrorDialog, backendTxt) {
        // Added custom handler for select
        Backbone.Stickit.addHandler({
            selector: 'select',
            initialize: function($el, model, options) {
                if ($el.is("select[multiple]")) {
                    $el.multiselect({
                        selectedList: options.selectedList,
                        noneSelectedText: options.noneSelectedText
                    }).multiselectfilter();
                }
            }
        });
    
        // Within this scope, jquery and jquery UI have been loaded.
    
        // Initialize routing
        var router = new Router();
    
        /** http://backbonejs.org/#Sync-emulateHTTP */
        //Backbone.emulateHTTP = true;
    
        //Base url for API calls
        var apiUrl = JSON.parse(backendTxt).backend_endpoint;
        //apiUrl = JSON.parse(backendTxt).backend_endpoint;
    
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

        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    
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
                if (!$.isEmptyObject(this.previousView)) {
                    this.previousView.close();
                }
            },
    
            gotoPreviousState: function() {
                router.navigate(this.previousState, {trigger: true});
            }
        };
    }
);
