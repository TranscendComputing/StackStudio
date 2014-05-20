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
        'views/resource/resourceAppView',
        'text!templates/google/compute/googleSnapshotAppTemplate.html',
        'google/models/compute/googleSnapshot',
        'google/collections/compute/googleSnapshots',
        'google/views/compute/googleSnapshotCreateView',
        'aws/collections/cloud_watch/awsMetricStatistics',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, googleInstanceAppTemplate, Instance, Instances, AwsInstanceCreate, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    // Aws Instance Application View
    // ------------------------------

    /**
     * GoogleSnapshotsAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a GoogleSnapshotsAppView instance.
     */
    var GoogleSnapshotsAppView = ResourceAppView.extend({
        
        template: _.template(googleInstanceAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
        
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "diskSizeGb", "status"],
        
        idColumnNumber: 1,
        
        model: Instance,
        
        collectionType: Instances,
        
        type: "disk",
        
        subtype: "snapshots",
        
        CreateView: AwsInstanceCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var instanceApp = this;
            Common.vent.on("snapshotAppRefresh", function() {
                instanceApp.render();
            });
            
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var disk = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Delete":
                //disk.delete(this.credentialId, this.region);
                alert('delete snapshot');
                break;
            }
        }
    });

    return GoogleSnapshotsAppView;
});
