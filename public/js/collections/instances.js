define([
        'jquery',
        'backbone',
        'models/instance',
        'common'
], function( $, Backbone, Instance, Common ) {
	'use strict';

	// Instance Collection
	// ---------------

	var InstanceList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Instance,

		url: 'data.json',

		// Filter down the list of all instance items that are running.
		running: function() {
			return this.filter(function( instance ) {
				return instance.get('running');
			});
		}
	});

	// Create our global collection of **Instances**.
	return new InstanceList();

});
