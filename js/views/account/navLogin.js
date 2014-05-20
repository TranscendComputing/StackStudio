/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'views/account/accountLoginView',
        'views/dashboardView',
        'jquery-ui'
], function( $, _, Backbone, Common, AccountLoginView, DashboardView ) {
    'use strict';

    var NavLogin = Backbone.View.extend({
        el: '#navLogin',

        accountMenuVisible: false,

        events: {
            'click #account_login': 'accountLogin',
            'click #account_logout': 'accountLogout'
        },

        initialize: function() {
            var navLogin = this;
            Common.vent.on("loginSuccess", function() {
                navLogin.render();
            });
        },

        render: function() {
            if(sessionStorage.login) {
                this.$el.html("<li id='nav_account' class='main_nav'><a href='#account/management'><i class='fa fa-user' style='padding-right:3px;'></i>"+sessionStorage.login+"</a></li><li><a id='account_logout'>Logout</a></li>");
            } else {
                this.$el.html("<li><a id='account_login'>Login</a></li>");
            }
        },

        accountLogin: function() {
            var accountLoginView = new AccountLoginView();
            accountLoginView.render();
        },

        accountLogout: function() {
            sessionStorage.clear();

            // Clear state so dashboard view can be refreshed
            Common.unloadPreviousState();
            var dashboardView = new DashboardView();
            Common.setPreviousState(dashboardView);

            // Navigate to root so username and Logout link go away
            Common.router.navigate("/", {trigger: true});
            this.render();

            // Re-render dashboardView so we can see getstarted div
            dashboardView.render();
        }
    });

    return NavLogin;
});
