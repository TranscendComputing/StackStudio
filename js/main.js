/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
var URL_ARGS, DEBUG;

if (DEBUG) {
    URL_ARGS = 'cb=' + Math.random();
}

require(['./common'], function (common) {
    common.rssFeed = "http://www.transcendcomputing.com/feed/";
    require([
            'views/topNav',
            'views/account/navLogin',
            'views/dashboardView',
            'views/projectSidebarView',
            'views/account/accountManagementView',
            'views/cloud_setup/cloudSetupView',
            'views/projectAppView',
             // 'views/projectNavigationSidebarView',
             'views/projectResourceSidebarView',
             // 'views/projectListItemView',
             'views/projectEditView',
             'views/resource/resourceNavigationView',
             'views/images/imagesView',
             'views/assemblies/assembliesView',
             'views/platform_components/platformComponentsView',
             'views/stacks/stacksView',
             'views/offerings/offeringsView'
            ], function(TopNavView, NavLogin, DashboardView) {
        var topNav = new TopNavView(),
         navLogin = new NavLogin();
        topNav.render();
        navLogin.render();
        common.backbone.history.start();
    });
});
