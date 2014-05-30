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
      "click .toggle-nav": "toggleNav",
      "change input[name = 'mode']": "changeMode"
    },

    modeMap: {
      images: ["dev"],
      components: ["test"],
      assemblies: ["dev", "prod"],
      stacks: ["dev", "prod"],
      offerings: ["prod"],
      meshes: ["prod"]
    },

    enabledModes: [],

    selectedMode: "dev",

    initialize: function(){
      this.nav_toggler = this.$(".toggle-nav");
      this.$dev = this.$("#dev");
      this.$test = this.$("#test");
      this.$prod = this.$("#prod");
      this.nav_open = true;
      _.bindAll(this, 'navigate');
      Common.router.on('route', this.navigate);
    },

    render: function() {
      this.nav_toggler.button('toggle');
      this.changeMode(this.selectedMode);
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
    },

    navigateRegex: /(\w*)Route/,

    navigate: function(newRoute) {
      var area;
      area = this.navigateRegex.exec(newRoute);
      if (! area) {
        return;
      }
      this.enableModes(area[1]);
      if (this.enabledModes.length === 1) {
        this.changeMode(this.enabledModes[0]);
      }
    },

    enableModes: function(area) {
      var modeList = this.modeMap[area];
      console.log("Switch to: ", modeList);
      this.enabledModes = [];
      _.each(["dev", "test", "prod"], function(mode) {
        if ($.inArray( mode, modeList ) > -1) {
          this.enabledModes.push(mode);
          this["$"+mode].prop('disabled', false);
          this["$"+mode].parent().removeClass('disabled');
        } else {
          this["$"+mode].prop('disabled', true);
          this["$"+mode].parent().addClass('disabled');
          this["$"+mode].parent().removeClass("active");
        }
      }, this);
    },

    changeMode: function(evt) {
      var modeControl, newMode;
      if (evt.hasOwnProperty("target")) {
        modeControl = evt.target;
        newMode = $(evt.target).prop("id");
      } else {
        modeControl = this["$"+evt];
        modeControl.parent().addClass("active");
        newMode = evt;
      }
      if (newMode !== this.selectedMode) {
        modeControl = this["$"+this.selectedMode];
        modeControl.parent().removeClass("active");
      }
      this.selectedMode = newMode;
      console.log("Firing..."+newMode);
      Common.vent.trigger('global:modeChange', newMode);
    }
  });

  return TopNavView;
});
