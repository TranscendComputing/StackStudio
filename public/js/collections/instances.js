var instanceapp = instanceapp || {};

(function() {
	'use strict';

	// Instance Collection
	// ---------------

	var InstanceList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: instanceapp.Instance,

		url: 'data.json',

		// Filter down the list of all instance items that are running.
		running: function() {
			return this.filter(function( instance ) {
				return instance.get('running');
			});
		}
	});

	// Create our global collection of **Instances**.
	instanceapp.Instances = new InstanceList();

}());
