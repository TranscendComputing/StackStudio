var instanceapp = instanceapp || {};

$(function() {
	'use strict';

	// Instance View
	// --------------

	instanceapp.InstanceView = Backbone.View.extend({

		// The DOM events specific to an item.
		events: {
			'dblclick label':	'edit',
		},

		// The InstanceView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Instance** and a **InstanceView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.model.on( 'change', this.render, this );
			this.model.on( 'destroy', this.remove, this );
			this.model.on( 'visible', this.toggleVisible, this );
		},

		// Re-render the titles of the instance item.
		render: function() {
			var selector_i = "#instance-table tr:nth-child(";
			var selector_n = "#instance-table tr td:contains('";
			var row = $(selector_n+this.model.get("instanceId")+"')").parent();
		    console.log("Old row:", row);
		    // if there's an existing row, update it.
		    // otherwise; create a new row.
			var added = $('#instance-table').dataTable().
				fnAddData( [
				            this.model.get("name"),
				            this.model.get("instanceId"),
				            this.model.get("keyName"),
				            this.model.get("running")
				            ]
			);
			//this.setElement( $(v[0]) );
		    console.log("Rendering an instance view:" + added[0], this.model.get("name"));
		    console.log("Rendering an instance view:", $(selector_i+(added[0]+1)+')'));
			this.setElement( $(selector_i+(added[0]+1)+')') );
			return this;
		},

		selectx: function() {
			//console.log("I am selected," this.model);
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function() {
			this.$el.addClass('editing');
			this.input.focus();
		},

		// Close the `"editing"` mode, saving changes to the instance.
		close: function() {
			var value = this.input.val().trim();

			if ( value ) {
				this.model.save({ title: value });
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function( e ) {
			if ( e.which === ENTER_KEY ) {
				this.close();
			}
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function() {
			this.model.destroy();
		}
	});
});
