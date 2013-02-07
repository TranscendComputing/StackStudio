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
        'views/accountLoginView',
        'jquery-ui'
], function( $, _, Backbone, Common, AccountLoginView ) {
    'use strict';

    var NavLogin = Backbone.View.extend({
        el: '#navLogin',
        
        accountMenuVisible: false,
        
        events: {
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            if(sessionStorage.login) {
                this.$el.html("<li id='navAccount'><a href='/#account/cloudcredentials'>"+sessionStorage.login+"</a></li><li><a href='/#account/logout'>Logout</a></li>");
            } else {
                this.$el.html("<li><a href='/#account/login'>Login</a></li>");
            }
        },
        
        accountLogin: function() {
            var accountLoginView = new AccountLoginView();
            accountLoginView.render();
        }
    });
    
    var navLogin;
    
    Common.router.on("route:accountLogin", function() {
        if (!navLogin) {
            navLogin = new NavLogin();
        }
        navLogin.accountLogin();
    }, this);
    
    Common.vent.on("loginSuccess", function() {
        if (!navLogin) {
            navLogin = new NavLogin();
        }
        navLogin.render();
    }, this);
    
    Common.router.on('route:accountLogout', function () {
        if (!navLogin) {
            navLogin = new NavLogin();
        }
        sessionStorage.clear();
        Common.router.navigate("/", {trigger: true});
        navLogin.render();
    }, this);
    
    console.log("nav login defined");
    return NavLogin;
});