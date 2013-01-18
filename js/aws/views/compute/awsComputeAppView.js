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
        'views/compute/computeAppView',
        'text!templates/aws/compute/awsComputeAppTemplate.html',
        '/js/aws/models/compute/awsCompute.js',
        '/js/aws/collections/compute/awsComputes.js',
        '/js/aws/views/compute/awsComputeRowView.js',
        '/js/aws/views/compute/awsComputeCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ComputeAppView, awsComputeAppTemplate, compute, computes, AwsComputeRowView, AwsComputeCreate, ich, Common ) {
	'use strict';

	// Aws Compute Application View
	// ------------------------------

    /**
     * Aws ComputeAppView is UI view list of cloud instances.
     *
     * @name ComputeAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsComputeAppView instance.
     */
	var AwsComputeAppView = ComputeAppView.extend({
	    compute: compute,
	    computes: computes,
		events: {
			'click #new_compute': 'createNew',
			'click #compute_table tbody': 'clickOne'
		},

		initialize: function() {
			var compiledTemplate = _.template(awsComputeAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
			$('#new_compute').button();
            this.$table = $('#compute_table').dataTable({"bJQueryUI": true});
			this.computes.on( 'add', this.addOne, this );
			this.computes.on( 'reset', this.addAll, this );
			this.computes.on( 'all', this.render, this );

			// Fetch will pull results from the server
			this.computes.fetch();
		},

		createNew : function () {
			var awsComputeCreate = new AwsComputeCreate();
			awsComputeCreate.render();
		}
	});
    
	return AwsComputeAppView;
});
