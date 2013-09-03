/*
TODO LIST:

*/


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
        'jquery.sortable'
], function( $, _, bootstrap, Backbone) {
	// Sortable Run List
	// ------------------------------

  /**
   * SortableRunList is sortable UI view of apps to be added.
   *
   * @name SortableRunList
   * @constructor
   * @category Apps
   * @param {Object} initialization object.
   * @returns {Object} Returns a SortableRunList project.
   */
  var SortableRunList = Backbone.View.extend({
    id: 'sortableRunList_view',

    //className: [''],

    //template: _.template(appsTemplate),

    //cloudProvider: undefined,

    //appsApp: undefined,

    //subViews: [],

    events: {
        "orderChanged" : "orderChangedHandler"
    },

    initialize: function() {
        console.log("Initialize SortableRunList");
    },

    render: function(){
      
    }
  });

  return SortableRunList;
});
