/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/* jshint smarttabs:true */
requirejs.config({
    //baseUrl: 'js/vendor',
    baseUrl: '',
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
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.queryparams': {
            deps: ['backbone']
        },
        'backbone.stickit': {
            deps: ['backbone', 'underscore', 'jquery']
        },
        'backbone-validation': {
            deps: ['backbone', 'jquery']
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
        'URIjs': {},
        'instructor': {
            deps: ['jquery', 'jquery-ui']
        }
    },
    paths: {
        /* Set some paths so rest of application can use relative paths */
        collections: 'js/collections',
        models: 'js/models',
        routers: 'js/routers',
        'views': 'js/views',
        interpreters: 'js/interpreters',
        templates: 'templates',
        wrappers: 'wrappers',
        URIjs: 'js/vendor/URI',
        'common': 'js/common',
         /* Backbone Stuff */
        'backbone': 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
        'backbone.stickit': 'js/vendor/backbone.stickit.min',
        'backbone-validation': 'js/vendor/backbone-validation.min',
        'backbone.queryparams': 'js/vendor/backbone.queryparams',
         /* jQuery Stuff */
        'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        'jquery-ui': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
        'jquery.form': 'http://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.45/jquery.form',
        'jquery.terminal': 'js/vendor/jquery.terminal',
        'jquery.mousewheel': 'js/vendor/jquery.mousewheel-min',
        'jquery.multiselect': 'http://cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.min',
        'jquery.multiselect.filter': 'http://cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.filter.min',
        'jquery.jstree': 'http://cdn.jsdelivr.net/jquery.jstree/pre1.0/jquery.jstree',
        'jquery-migrate': 'http://code.jquery.com/jquery-migrate-1.1.0',
        'jquery.cookie': 'js/vendor/jquery.cookie',
        'jquery-plugins': 'js/vendor/jquery-plugins',
        'jquery-ui-plugins': 'js/vendor/jquery-ui-plugins',
        'jquery.dataTables': 'js/vendor/jquery.dataTables',
        'jquery.coverscroll.min': 'js/vendor/jquery.coverscroll.min',
        'jquery.purr': 'js/vendor/jquery.purr',
        'jquery.sortable': 'js/vendor/jquery.sortable',
        'jquery.dataTables.fnProcessingIndicator': '/js/vendor/jquery.dataTables.fnProcessingIndicator',
        /* Other Stuff */
        'underscore' : 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.0/lodash.min',
        'icanhaz'    : 'js/vendor/ICanHaz',
        'messenger'  : 'js/vendor/messenger.min',
        'raphael'    : 'js/vendor/raphael-min',
        'spinner'    : 'js/vendor/spin.min',
        'text'       : 'js/vendor/text',
        'bootstrap'  : 'http://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
        'typeahead'  : 'js/vendor/twitter/typeahead',
        'ace'        : 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace',
        'mode-json'  : 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/mode-json',
        'dataTables.bootstrap': 'js/vendor/dataTables.bootstrap',
        'FeedEk'     : 'js/vendor/FeedEk',
        'opentip'    : 'js/vendor/opentip',
        'gh3'        : 'js/vendor/gh3',
        'base64'     : 'js/vendor/base64',
        'instructor' : 'js/vendor/instructor',
        'mixins'     : 'js/vendor/mixins',
        'github'     : 'js/vendor/github'
    }
});
