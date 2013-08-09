/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'icanhaz',
        'common',
        'typeahead', // Not an AMD component!
        'text!templates/apps/appListItemTemplate.html',
        'collections/apps',
        'models/app',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, bootstrap, Backbone, ich, Common, typeahead, appListItemTemplate, Apps, App ) {
	    /**
     * AppsListItem is UI view of app to be added.
     *
     * @name AppsListItem
     * @constructor
     * @category Apps
     * @param {Object} initialization object.
     * @returns {Object} Returns an AppsListItem view.
     */
    var AppListItemView = Backbone.View.extend({

        template: _.template(appListItemTemplate),

        events: {
            "click .close": "removeClicked"
        },

        initialize: function() {
          this.model.on('change', this.render, this);
          this.model.on('destroy', this.remove, this);
        }, 

        removeClicked: function(ev){
          this.trigger("appRemoved", this.model);
          return false;
        },

        render: function() {
          var $el = $(this.el);
          $el.html(this.template({model: this.model}));
          return this;
        }
    });
    return AppListItemView;
});