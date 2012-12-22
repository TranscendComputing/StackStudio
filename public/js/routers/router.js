var instanceapp = instanceapp || {};

(function() {
	'use strict';

	// Instance Router
	// ----------

	var Workspace = Backbone.Router.extend({
		routes:{
			'*filter': 'setFilter'
		},

		setFilter: function( param ) {
			// Set the current filter to be used
			window.instanceapp.InstanceFilter = param.trim() || '';

			// Trigger a collection filter event, causing hiding/unhiding
			// of Instance view items
			window.instanceapp.Instances.trigger('filter');
		}
	});

	instanceapp.InstanceRouter = new Workspace();
	Backbone.history.start();

}());
