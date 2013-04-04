/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'icanhaz',
        'text!templates/mspDashboard.html',
        'collections/serviceOfferings',
        'FeedEk',
        'jquery.list'
], function( $, _, Backbone, Common, ich, dashboardTemplate, Offerings, FeedEk ) {
    
    var DashboardView = Backbone.View.extend({
        el: "#main",
        template: dashboardTemplate,
        collection: Offerings,
        events: {
            "click ul.dashboard-list li a": "handleClick"
        },
        initialize: function() {
            this.collection.on("reset", this.render, this);
            this.collection.fetch({reset: true});
        },

        render: function() {
            ich.addTemplate("dashboard_view", this.template);
            this.$el.html(ich.dashboard_view({company: Common.companyName, offerings: this.collection.toJSON()}));
            $("#divRss").FeedEk({
                FeedUrl: Common.rssFeed,
                MaxCount: 5,
                ShowDesc: true,
                ShowPubDate: true,
                DescCharacterLimit: 200,
                TitleLinkTarget: '_blank'
            });
            
            //this.$('ul').list({
            //    headerSelector: 'li.dashboard-list-heading'
            //});
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

        handleClick: function() {
            if(!sessionStorage.cloud_credentials)
            {
                return false;
            }
        }
    });
    /** Variable to track whether view has been initialized or not */
    var dashboardView;

    Common.router.on("route:dashboard", function () {
        if (this.previousView !== dashboardView) {
            this.unloadPreviousState();
            dashboardView = new DashboardView();
            this.setPreviousState(dashboardView);
        }
    }, Common);

    return DashboardView;
});
