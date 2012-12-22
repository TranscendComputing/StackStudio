var instanceapp = instanceapp || {};

(function() {
	'use strict';

	// Instance Model
	// ----------

	// Our basic **Instance** model has `name`, `instanceId`, and `running` attributes.
	instanceapp.Instance = Backbone.Model.extend({

		// Default attributes for the instance
		// and ensure that each instance created has `name` and `running` keys.
		defaults: {
			name: '-',
			description: '',
			instanceId: '',
			imageId: '',
			imageName: '-',
			zone: '',
			state: '',
			keypairName: '-',
			publicIp: '0.0.0.0',
			privateIp: '0.0.0.0',
			running: false
		},

		set: function(attributes, options) {
		    Backbone.Model.prototype.set.apply(this, arguments);
		    console.log("Setting attributes on model:", attributes);
		},

		// Toggle the `running` state of this instance.
		toggle: function() {
			this.save({
				running: !this.get('running')
			});
		}

	});

}());
