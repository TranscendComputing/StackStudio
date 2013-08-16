/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
