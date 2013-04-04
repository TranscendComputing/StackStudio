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
        'text!templates/dashboard.html',
        'FeedEk'
], function( $, _, Backbone, Common, dashboardTemplate, FeedEk ) {
    
    var DashboardView = Backbone.View.extend({
        el: "#main",
        template: _.template(dashboardTemplate),

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(this.template);
            $("#divRss").FeedEk({
                FeedUrl: Common.rssFeed,
                MaxCount: 5,
                ShowDesc: true,
                ShowPubDate: true,
                DescCharacterLimit: 200,
                TitleLinkTarget: '_blank'
            });
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
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
