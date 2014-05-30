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
  'common'
], function($, _, Backbone, Common) {

  var DialogView = Backbone.View.extend({

    tagName: "div",

    cancel: function() {
      this.$el.dialog('close');
    },

    close: function() {
      this.$el.remove();
    },

    // For backbone.stickit support
    // This function calls stickit once all collections have been fetched
    applyBindings: function() {
      this.respondedCount = this.respondedCount ? this.respondedCount + 1 : 1;
      if (this.respondedCount === this.collectionsCount) {
        this.stickit();
      }
    }
  });
  return DialogView;
});