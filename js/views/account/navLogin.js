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
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'views/account/accountLoginView',
        'jquery-ui'
], function( $, _, Backbone, Common, AccountLoginView ) {
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
                this.$el.html("<li id='navAccount'><a href='/#account/management/home'>"+sessionStorage.login+"</a></li><li><a id='account_logout'>Logout</a></li>");
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
            Common.router.navigate("/", {trigger: true});
            this.render();
        }
    });

    return NavLogin;
});