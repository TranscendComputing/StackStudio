/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'models/instance',
        'collections/instances',
        'views/instanceRowView'
], function( $, _, Backbone, Instance, instances, InstanceView ) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **InstancesView** is the top-level piece of UI.
	var InstancesView = Backbone.View.extend({

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
			instances.on( 'add', this.addOne, this );
			instances.on( 'reset', this.addAll, this );
			instances.on( 'all', this.render, this );

			// Fetch will pull results from the server
			instances.fetch();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
		},

		// Add a single instance item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function( instance ) {
			var view = new InstanceView({ model: instance });
			view.render();
		    console.log("Adding a single instance view.");
		},

		// Add all items in the **Instances** collection at once.
		addAll: function() {
			instances.each(this.addOne, this);
		},

		createNew : function () {
			this.$detail.html(this.formTemplate(
				instances.create()
			));
			$('#id_save_new').button();
		}
	});
	return InstancesView;
});
