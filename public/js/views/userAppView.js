/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under MIT license <https://raw.github.com/TranscendComputing/StackStudio/master/LICENSE.md>
 */
var instanceapp = instanceapp || {};

$(function( $ ) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **InstancesView** is the top-level piece of UI.
	instanceapp.InstancesView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#instanceapp',

		// Our template for the detailed view of an instance at the bottom of the app.
		detailTemplate: _.template( $('#instance-detail').html() ),

		// Our template for the create view of an instance at the bottom of the app.
		formTemplate: _.template( $('#instance-form').html() ),

		// Delegated events for creating new instances, etc.
		events: {
			'click #new-instance': 'createNew'
		},

		// At initialization we bind to the relevant events on the `Instances`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting instances.
		initialize: function() {
            this.$detail = this.$('#detail');
			window.instanceapp.Instances.on( 'add', this.addOne, this );
			window.instanceapp.Instances.on( 'reset', this.addAll, this );
			window.instanceapp.Instances.on( 'all', this.render, this );

			// Fetch will pull results from the server
			instanceapp.Instances.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			/*
			var completed = instanceapp.Instances.running().length;
			var remaining = instanceapp.Instances.remaining().length;

			if ( instanceapp.Instances.length ) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + ( instanceapp.InstanceFilter || '' ) + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;
			*/
		},

		// Add a single instance item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function( instance ) {
			var view = new instanceapp.InstanceView({ model: instance });
			view.render();
		    console.log("Adding a single instance view.");
		},

		// Add all items in the **Instances** collection at once.
		addAll: function() {
			instanceapp.Instances.each(this.addOne, this);
		},

		createNew : function () {
			this.$detail.html(this.formTemplate(
				instanceapp.Instances.create()
			));
			$('#id_save_new').button();
		},
	});

	$('#new_instance').click(function() {

	});
});
