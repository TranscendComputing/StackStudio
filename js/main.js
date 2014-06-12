/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
var DEBUG = false;
require(['config/rjsConfig'], function(undefined) {
    if (DEBUG) {
        requirejs.config({urlArgs: 'cb=' + Math.random()});
    }

    require(
        [
            'common',
            // Load all main navigation views here so they are accessible
            // from top level and let all sub-views be loaded by these views
            'views/account/navLogin',
            'views/dashboardView',
            'views/account/accountManagementView',
            'views/cloud_setup/cloudSetupView',
            'views/images/imagesView',
            'views/platform_components/platformComponentsView',
            'views/assemblies/assembliesView',
            'views/stacks/stacksView',
            'views/offerings/offeringsView',
            'views/resource/resourceNavigationView'
            //'views/meshes/meshesView'
        ],
        function(Common, NavLogin) {
            new NavLogin().render();
            Common.backbone.history.start();
        }
    );
});
