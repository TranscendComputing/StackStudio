/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/homeTemplate.html'
    ],
    function ( $, _, Backbone, Common, homeTemplate ) {

        var AccountManagementView = Backbone.View.extend({

            template: _.template(homeTemplate),
            /** @type {Object} Object of events for view to listen on */
            events: {
                "click #addUser": "addUser"
            },

            /** Constructor method for current view */
            initialize: function(options) {
                //Render my own views
                this.render();
            },

            /** Add all of my own html elements */
            render: function () {
                this.$el.html(this.template);
                $('#main').html(this.$el);
            }
        });

        Common.router.on('route:account/management', function () {
            if(sessionStorage.account_id) {
                var accountView = new AccountManagementView();
            } else {
                Common.router.navigate("", {trigger: true});
                Common.errorDialog("Login Error", "You must login.");
            }
        });

        return AccountManagementView;
    }
);
