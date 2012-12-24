define([
        'jquery',
        'underscore',
        'backbone',
        'models/Instance',
        'collections/instances',
        'views/instanceRowView',
        'jquery.dataTables'
], function( $, _, Backbone, Instance, instances, InstanceView ) {
	'use strict';

	// The Instances Application View
	// ------------------------------

	// Our overall **InstancesView** is the top-level piece of UI.
	var InstancesView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#instanceapp',

		// Our template for the detailed view of an instance at the bottom of the app.
		// TODO: rewrite as ICanHaz templates.
		detailTemplate: _.template( $('#instance-detail').html() ),

		// Our template for the create view of an instance at the bottom of the app.
		// TODO: rewrite as ICanHaz templates.
		formTemplate: _.template( $('#instance-form').html() ),

		// Delegated events for creating new instances, etc.
		events: {
			'click #new_instance': 'createNew',
			'click #instance-table tbody': 'selectOne'
		},

		// At initialization we bind to the relevant events on the `Instances`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting instances.
		initialize: function() {
			$('#new_instance').button();
			$('#id_refresh').button();
            this.$detail = this.$('#detail');
            this.$table = $('#instance-table').dataTable({"bJQueryUI": true});
			instances.on( 'add', this.addOne, this );
			instances.on( 'reset', this.addAll, this );
			instances.on( 'all', this.render, this );

			// Fetch will pull results from the server
			instances.fetch();
		},

		// No rendering to do, presently; the elments are already on the page.
		render: function() {
		},

		// Add a single instance item to the list by creating a view for it.
		addOne: function( instance ) {
			if (instance.get('instanceId') == "") {
				// Refuse to add instances until they're initialized.
				return;
			}
			var view = new InstanceView({ model: instance });
			view.render();
		    console.log("Adding a single instance view.");
		},

		// Add all items in the **Instances** collection at once.
		addAll: function() {
			instances.each(this.addOne, this);
		},

		createNew : function () {
			this.$detail.html(ich.instance_form(
				new Instance().attributes
			));
			$('#id_save_new').button();
		},

		selectOne : function () {
			var i, instance, selectedModel;
			this.$table.$('tr').removeClass('row_selected');
			$(event.target.parentNode).addClass('row_selected');
			instance = $(event.target.parentNode).find(':nth-child(2)').html();
			instances.each(function(e) {
				if (e.get('instanceId') == instance) {
					selectedModel = e;
				}
			});
			this.$detail.html(ich.instance_detail(selectedModel.attributes));
			//this.$detail.html(this.detailTemplate(
			//		selectedModel.attributes
			//	));
			window.location = "#instance-detail";
		}
	});

	// The following click should be redundant with the events above,
	// but not working at the mo.  TODO: eliminate this.
	//$('#new_instance').click(function() {
	//	instancesview.createNew();
	//});

	return InstancesView;
});
