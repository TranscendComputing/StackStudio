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
        'views/resource/resourceRowView',
        'text!templates/aws/cloud_formation/awsCloudFormationAppTemplate.html',
        '/js/aws/models/cloud_formation/awsStack.js',
        '/js/aws/collections/cloud_formation/awsStacks.js',
        '/js/aws/views/cloud_formation/awsCloudFormationStackCreateView.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, awsCloudFormationAppTemplate, Stack, Stacks, StackCreate, ich, Common, Morris, Spinner ) {
    'use strict';

    var AwsCloudFormationAppView = ResourceAppView.extend({

        template: _.template(awsCloudFormationAppTemplate),

        modelStringIdentifier: "name",

        columns: ["StackName", "Description", "StackStatus", "CreationTime"],
        
        idColumnNumber: 0,
        
        model: Stack,
        
        collectionType: Stacks,

        type: "cloud_formation",
        
        subtype: "cloud_formation",

        CreateView: StackCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'tabsactivate' : 'loadStackResources'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var topicApp = this;
            Common.vent.on("cloudFormationAppRefresh", function() {
                topicApp.render();
            });
        },

        toggleActions: function(e) {
            //Disable any needed actions
            $(".simple-tab-table").dataTable({
                "bJQueryUI":true,
                "bPaginate": false,
                "sDom": 't'
            });
            var $this = this;
            var stack = this.collection.get(this.selectedId);

            var resourcesTable = $("#resources-tab table").dataTable({
                "bJQueryUI": true,
                "bPaginate": false,
                "bProcessing": true,
                "sDom": 'rt',
                "aoColumns": [{"sTitle": "Logical ID","mData": "LogicalResourceId"},
                    {"sTitle": "Physical ID",
                        mData: function(data){
                            return data.PhysicalResourceId ? data.PhysicalResourceId : "";
                        }
                    },
                    {"sTitle": "Type",  "mData": "ResourceType"},
                    {"sTitle": "Action","mData": "ResourceStatus"},
                    {"sTitle": "Reason",
                        mData: function(data){
                            return data.ResourceStatusReason ? data.ResourceStatusReason : "";
                        }
                }]
            });
            resourcesTable.fnProcessingIndicator(true);

            var eventsTable = $("#events-tab table").dataTable({
                "bJQueryUI": true,
                "bPaginate": false,
                "bProcessing": true,
                "sDom": 'tr',
                "aoColumns": [{"sTitle": "Time", "mData": "Timestamp", sWidth: "15em"},
                    {"sTitle": "Type", "mData": "ResourceType"},
                    {"sTitle": "Logical ID", "mData": "LogicalResourceId"},
                    {"sTitle": "Physical ID", "mData": "PhysicalResourceId"},
                    {"sTitle": "Status", "mData": "ResourceStatus"},
                    {"sTitle": "Reason",
                        mData: function(data){
                            return data.ResourceStatusReason ? data.ResourceStatusReason : "";
                        }
                }]
            });
            eventsTable.fnProcessingIndicator(true);


            stack.fetchResources({}, this.credentialId, this.region);
            stack.fetchEvents({}, this.credentialId, this.region);
            stack.fetchTemplate({}, this.credentialId, this.region);


            Common.vent.once("stackResourcesLoaded", function(data) {
               resourcesTable.fnAddData(data);
               resourcesTable.fnProcessingIndicator(false);
            });

            Common.vent.once("stackEventsLoaded", function(data){
                eventsTable.fnAddData(data);
                eventsTable.fnProcessingIndicator(false);
            });

            Common.vent.once("stackTemplateLoaded", function(data){
                var templateString = JSON.stringify(data, undefined, 3);
                $("#template-tab").html("<pre>"+ templateString + "</pre>");
            });

        },
        performAction: function(event) {
            var autoscaleGroup = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
                case "Spin Down Group":
                    autoscaleGroup.spinDown(this.credentialId, this.region);
                    break;
                case "Delete Group":
                    autoscaleGroup.destroy(this.credentialId, this.region);
                    break;
            }
        },


    });
    
    return AwsCloudFormationAppView;
});
