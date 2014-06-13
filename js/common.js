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
        'icanhaz',
        'ace',
        'views/consoleAppView',
        'routers/router',
        'views/errorDialog',
        'text!config/backend.json',
        'bootstrap',
        'jquery-ui',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree',
        'jquery.form',
        'jquery.dataTables',
        'backbone.stickit',
        'dataTables.bootstrap'
    ],
    function ( $, _, Backbone, Ich, Ace, CommandLineView, Router, ErrorDialog, backendTxt ) {
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
        };
    
        // Initialize the command line, since that's global to all pages.
        var consoleAppView = new CommandLineView();

        var Common = {
            InstanceFilter: '', //  Which filter (empty, active, completed)?
            ENTER_KEY: 13, // Define enter key constant?
            router: router, // Router object instance
            apiUrl: apiUrl, // Base API URI
            vent: vent, // Custom event handlng object
            consoleAppView: consoleAppView, // Self explanatory
            icons: icons, // Icon object instance
            jquery: $,
            underscore: _,
            backbone: Backbone, // Backbone framework instance
            //bootstrap: Bootstrap,
            ace: Ace,
            icanhaz: Ich,
            previousView: {}, // Default previousView object
            cacheCollection: {}, // Default cacheCollection object

            // RSS Feed URI
            rssFeed: 'http://www.transcendcomputing.com/feed/',

            cache : function ( key, value ) {
              var self = this;
              if(!value) {
                if(!this.cacheCollection[key]) {
                  var sessionValue;
                  try {
                    var sessionValue = sessionStorage[key]
                    self.cacheCollection[key] = JSON.parse(sessionStorage[key]);
                  } catch ( err ) {
                    this.cacheCollection[key] = sessionValue;
                  }
                }
                return this.cacheCollection[key];
              }

              this.cacheCollection[key] = value;
              if(typeof Storage !== 'undefined') {
                sessionStorage[key] = JSON.stringify(value);
              }
            },

            clearCache : function () {
              this.cacheCollection = {};
              if(typeof Storage !== 'undefined') {
                sessionStorage.clear();
              }
            },

            login : function ( options ) {
              this.router.navigate('#', { trigger: true });
              require([
                'views/account/accountLoginView'
              ], function ( LoginView ) {
                var loginView = new LoginView(options);
                loginView.render();    
              });
            },

            authenticate : function ( options ) {
              options = options || {};
              if(!this.account) {
                if(options.redirect === 'here') {
                  options.redirect = window.location.hash;
                }
                this.login(options);
              }
              return !!this.account;
            },
    
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
            },

            logo : function ( key ) {
              var logos = {
                aws : '/images/ImageLogos/amazon20.png',
                redhat : '/images/ImageLogos/redhead20.png',
                suse : '/images/ImageLogos/suse20.png',
                ubuntu : '/images/ImageLogos/canonical20.gif',
                windows : '/images/ImageLogos/windows20.png',
                centos : '/images/ImageLogos/centos.gif',
                fedora : '/images/ImageLogos/fedora36.png'
              };
              return logos[key];
            }
        };

        Common.__defineGetter__("account", function () {
          return Common.cache('account');
        });

        Common.__defineSetter__("account", function ( val ) {
          Common.cache('account', val);          
        });

        Common.__defineGetter__("credentials", function () {
          return Common.account.cloud_credentials;
        });

        Common.__defineSetter__("credentials", function ( val ) {
          if(!Common.account) {
            Common.account = {};
          }

          Common.account.cloud_credentials = val;

          // Have to update update sessionStorage here as well since Cloud.cache
          // gets its initial values from sessionStorage when page is refreshed
          //
          // Also, sessionStorage is a flat key/value pair store. Meaning that
          // sessionStorage is an object but sessionStorage.account is a string
          // and not a nested object. In order to update properly, we need to convert
          // sessionStorage.acount into an object, update cloud_credentials and then
          // re-assign as converted string.
          var sess_account = JSON.parse(sessionStorage.account);
          sess_account.cloud_credentials = val;
          sessionStorage.account = JSON.stringify(sess_account);
        });

        return Common;
    }
);
