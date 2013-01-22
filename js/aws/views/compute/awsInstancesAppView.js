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
        'views/compute/instancesAppView',
        'text!templates/aws/compute/awsInstanceAppTemplate.html',
        '/js/aws/models/compute/awsInstance.js',
        '/js/aws/collections/compute/awsInstances.js',
        '/js/aws/views/compute/awsInstanceRowView.js',
        '/js/aws/views/compute/awsInstanceCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, InstancesAppView, awsInstanceAppTemplate, instance, instances, AwsInstanceRowView, AwsInstanceCreate, ich, Common ) {
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
    var AwsInstancesAppView = InstancesAppView.extend({
        instance: instance,
        instances: instances,
        events: {
            'click #new_instance': 'createNew',
            'click #instance_table tbody': 'clickOne'
        },

        initialize: function() {
            var compiledTemplate = _.template(awsInstanceAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
            $('#new_instance').button();
            this.$table = $('#instance_table').dataTable({"bJQueryUI": true});
            this.instances.on( 'add', this.addOne, this );
            this.instances.on( 'reset', this.addAll, this );
            this.instances.on( 'all', this.render, this );

            // Fetch will pull results from the server
            this.instances.fetch();
        },
        
        clickOne: function (event) {
            var instanceId, parentNode;
            console.log("event:", event);
            parentNode = event.target.parentNode;
            // Find the second column of the clicked row; that's compute ID
            instanceId = $(parentNode).find(':nth-child(2)').html();
            Common.router.navigate("#resources/aws/compute/instances/"+instanceId, {trigger: false});
            this.selectOne(instanceId, parentNode);
        },

        createNew : function () {
            var awsInstanceCreate = new AwsInstanceCreate();
            awsInstanceCreate.render();
        }
    });
    
    return AwsInstancesAppView;
});
