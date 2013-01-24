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
        '/js/aws/views/compute/awsInstanceCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsInstanceAppTemplate, Instance, instances, AwsInstanceCreate, ich, Common ) {
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
        template: _.template(awsInstanceAppTemplate),
        
        modelStringIdentifier: "instanceId",
        
        columns: ["name", "instanceId", "keyName", "running"],
        
        idColumnNumber: 1,
        
        model: Instance,
        
        collection: instances,
        
        type: "compute",
        
        subtype: "instances",
        
        CreateView: AwsInstanceCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
            $("#action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            var rowData = this.$table.fnGetData(e.currentTarget);
            if (rowData[3]) {
                console.log($("#action_menu").menu("widget"));
            }
        }
    });
    
    return AwsInstancesAppView;
});
