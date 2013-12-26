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
  'common'
], function( $, _, Backbone, Common) {

  var TopNavView = Backbone.View.extend({

    el: "nav.navbar",

    events: {
      "click .toggle-nav": "toggleNav"
    },
    initialize: function(){
      this.nav_toggler = this.$(".toggle-nav");
      this.nav_open = true;
    },

    render: function() {
      this.nav_toggler.button('toggle');
      return this;
    },
    toggleNav: function() {
      this.nav_toggler.button('toggle');
      if (!this.nav_open) {
        $("body").addClass("main-nav-opened").removeClass("main-nav-closed");
      } else {
        $("body").removeClass("main-nav-opened").addClass("main-nav-closed");
      }
      this.nav_open = ! this.nav_open;
      return false;
    }

  });

  return TopNavView;
});
