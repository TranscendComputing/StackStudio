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
    'js/views/account/homeView'
  ],
  function ( $, _, Backbone, Common, HomeView ) {

    var AccountManagementView = Backbone.View.extend({

      /** @type {Object} Object of events for view to listen on */
      events: {
        "click #addUser": "addUser"
      },

      initialize : function ( options ) {
        this.subView = new HomeView();
      },

      /** Add all of my own html elements */
      render: function() {
        this.subView.render();
      }
    });

    Common.router.on('route:account/management', function() {
      if (Common.account) {
        var accountView = new AccountManagementView();
        accountView.render();
      } else {
        Common.router.navigate("", {
          trigger: true
        });
        Common.login();
      }
    });

    return AccountManagementView;
  }
);