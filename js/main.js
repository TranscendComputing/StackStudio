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
    var dashboardView;
    var site = window.location.hostname.split(".")[0];
    var siteParam = window.location.search.replace("?site=", "");
    if(site.indexOf("localhost") > -1 || site.indexOf("stackstudio") > -1 || site.indexOf("devessex") > -1 || site.length < 2)
    {
        dashboardView = "views/dashboardView";
        common.rssFeed = "http://www.transcendcomputing.com/feed/";
    }
    if(dashboardView === undefined || siteParam !== "")
    {
        if(siteParam !== "")
        {
            site = siteParam.toLowerCase();
        }
        var siteCss = "css/sites/" + site + ".css";
        var siteJs = "./js/sites/" + site + ".js";
        var fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", siteCss);
        document.getElementsByTagName("head")[0].appendChild(fileref);
        require([siteJs], function(){});
        dashboardView = "views/mspDashboardView";
    }
    require([
            'views/account/navLogin',
             dashboardView,
            'views/projectSidebarView',
            'views/account/accountManagementView',
            'views/projectAppView',
             // 'views/projectNavigationSidebarView',
             'views/projectResourceSidebarView',
             // 'views/projectListItemView',
             'views/projectEditView',
             'views/resource/resourceNavigationView',
             'views/images/imagesView',
             'views/assemblies/assembliesView',
             'views/stacks/stacksView',
             'views/offerings/offeringsView'
            ], function(NavLogin, DashboardView) {
        var navLogin = new NavLogin();
        navLogin.render();
        common.backbone.history.start();
    });
});
