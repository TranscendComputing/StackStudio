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
        'views/resourceAppView',
        'text!templates/aws/compute/awsInstanceAppTemplate.html',
        '/js/aws/models/compute/awsInstance.js',
        '/js/aws/collections/compute/awsInstances.js',
        '/js/aws/views/compute/awsInstanceRowView.js',
        '/js/aws/views/compute/awsInstanceCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsInstanceAppTemplate, Instance, instances, AwsInstanceRowView, AwsInstanceCreate, ich, Common ) {
    'use strict';

    // Aws Instance Application View
    // ------------------------------

    /**
     * AwsInstancesAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsInstancesAppView instance.
     */
    var AwsInstancesAppView = ResourceAppView.extend({
        modelStringIdentifier: "instanceId",
        
        idRowNumber: 2,
        
        model: Instance,
        
        collection: instances,
        
        type: "compute",
        
        subtype: "instances",
        
        CreateView: AwsInstanceCreate,
        
        RowView: AwsInstanceRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            var compiledTemplate = _.template(awsInstanceAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
            $('#create_button').button();
            this.$table = $('#resource_table').dataTable({"bJQueryUI": true});
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );
            this.collection.on( 'all', this.render, this );

            // Fetch will pull results from the server
            this.collection.fetch();
        }
    });
    
    return AwsInstancesAppView;
});
