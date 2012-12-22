var consoleapp = consoleapp || {};

(function() {
	'use strict';

	// Instance Model
	// ----------

	// Our basic **Command** model.
	instanceapp.CloudCommand = Backbone.Model.extend({

		// Default attributes for the instance
		defaults: {
			command: ''
		},
	});

}());
