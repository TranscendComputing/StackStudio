/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/chefEnvironment',
        'common'
], function( $, Backbone, ChefEnvironment, Common) {
	'use strict';

	// ChefEnvironments Collection
	// ---------------

	var ChefEnvironments = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: ChefEnvironment,
        url: Common.apiUrl + "/stackstudio/v1/orchestration/chef/environments",

        comparator : function(model){
			return model.get("name");
        },

        initialize: function() {
		    this.sortField = 'name';
		    this.sortDirection = "ASC";
		}
	
	});

	return ChefEnvironments;

});
