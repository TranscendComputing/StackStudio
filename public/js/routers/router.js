define([
        'jquery',
        'backbone',
        'collections/instances',
        'common'
], function( $, Backbone, Instances, Common ) {
	'use strict';

	// Instance Router
	// ----------

	var Workspace = Backbone.Router.extend({
		routes:{
			'*filter': 'setFilter'
		},

		setFilter: function( param ) {
			// Set the current filter to be used
			Common.InstanceFilter = param.trim() || '';

			// Trigger a collection filter event, causing hiding/unhiding
			// of Instance view items
			Instances.trigger('filter');
		}
	});

	return Workspace;
});
