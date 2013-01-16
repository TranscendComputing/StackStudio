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
        'text!templates/compute/computeAppTemplate.html',
        'models/compute/compute',
        'collections/compute/computes',
        'views/compute/computeRowView',
        'views/compute/computeCreateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, computeAppTemplate, compute, computes, ComputeRowView, ComputeCreate, ich, Common ) {
	'use strict';

	// Compute Application View
	// ------------------------------

    /**
     * ComputeAppView is UI view list of cloud instances.
     *
     * @name ComputeAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeAppView instance.
     */
	var ComputeAppView = Backbone.View.extend({

		/** The ID of the selected compute */
		selectedId: undefined,

		el: '#resource_app',

		events: {
			'click #new_compute': 'createNew',
			'click #compute_table tbody': 'clickOne'
		},

		initialize: function() {
			var compiledTemplate = _.template(computeAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
			$('#new_compute').button();
            this.$table = $('#compute_table').dataTable({"bJQueryUI": true});
			computes.on( 'add', this.addOne, this );
			computes.on( 'reset', this.addAll, this );
			computes.on( 'all', this.render, this );

			// Fetch will pull results from the server
			computes.fetch();
		},

		// No rendering to do, presently; the elements are already on the page.
		render: function() {
			//If compute id is supplied, select it
			if(this.selectedId) {
				this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
			}
		},

		// Add a single compute item to the list by creating a view for it.
		addOne: function( compute ) {
			if (compute.get('computeId') === "") {
				// Refuse to add computes until they're initialized.
				return;
			}
			var view = new ComputeRowView({ model: compute });
			view.render();
		},

		// Add all items in the **Instances** collection at once.
		addAll: function() {
			computes.each(this.addOne, this);
		},

		createNew : function () {
			var computeCreate = new ComputeCreate();
			computeCreate.render();
		},
		
		clickOne: function (event) {
			var instanceId, parentNode;
			console.log("event:", event);
			parentNode = event.target.parentNode;
			// Find the second column of the clicked row; that's compute ID
			instanceId = $(parentNode).find(':nth-child(2)').html();
			Common.router.navigate("#resources/compute/"+instanceId, {trigger: false});
			this.selectOne(instanceId, parentNode);
		},

		selectOne : function (instanceId, parentNode) {
			var selectedModel;
			this.clearSelection();
			console.log("Selecting ID:", instanceId);
			if(parentNode) {
				$(parentNode).addClass('row_selected');
			}
			
			computes.each(function(e) {
				if (e.get('instanceId') === instanceId) {
					selectedModel = e;
				}
			});
			
			if(selectedModel) {
				this.selectedId = instanceId;
				$("#details").html(ich.compute_detail(selectedModel.attributes));
				$("#detail_tabs").tabs();
			}else {
				
			}
		},
		
		clearSelection: function () {
			this.$table.$('tr').removeClass('row_selected');
			$('#details').html("");
		}
	});

	var computeAppView;
	
    Common.router.on('route:resources', function () {
        if (!computeAppView) {
        	computeAppView = new ComputeAppView();
        }
        console.log("compute app: resources route");
    }, this);
    
    Common.router.on('route:compute', function () {
        if (!computeAppView) {
        	computeAppView = new ComputeAppView();
        }
        console.log("compute app: compute route");
    }, this);
    
    Common.router.on('route:computeDetail', function (id) {
        if (!computeAppView) {
        	computeAppView = new ComputeAppView();
        }
        computeAppView.selectedId = id;
        computeAppView.render();
        console.log("compute app: compute detail route");
    }, this);

    console.log("compute app view defined");
    
	return ComputeAppView;
});
