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
        'views/account/accountLoginView',
        'FeedEk',
        'jquery.list'
], function( $, _, Backbone, Common, ich, dashboardTemplate, Offerings, AccountLoginView, FeedEk ) {
    
    var DashboardView = Backbone.View.extend({
        el: "#main",
        template: dashboardTemplate,
        collection: Offerings,
        events: {
            "click ul.dashboard-list li a": "handleClick",
            "click button.dashboard-login": "accountLogin"
        },
        initialize: function() {
            Common.vent.on("loginSuccess", this.hideLogin, this);
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
            if(sessionStorage.login)
            {
                $('button.dashboard-login').hide();
            }else{
                $('button.dashboard-login').button();
            }
            //this.$('ul').list({
            //    headerSelector: 'li.dashboard-list-heading'
            //});
        },

        accountLogin: function() {
            var accountLoginView = new AccountLoginView();
            accountLoginView.render();
        },

        hideLogin: function() {
            $('button.dashboard-login').hide();
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
