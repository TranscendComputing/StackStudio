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
        'text!templates/aws/dns/awsHostedZoneAppTemplate.html',
        'aws/models/dns/awsHostedZone',
        'aws/collections/dns/awsHostedZones',
        'aws/models/dns/awsRecordSet',
        'aws/collections/dns/awsRecordSets',
        'aws/views/dns/awsHostedZoneCreateView',
        'views/resource/resourceRowView',
        'aws/views/dns/awsRecordSetCreateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsHostedZoneAppTemplate, HostedZone, HostedZones, RecordSet, RecordSets, HostedZoneCreate, ResourceRowView, RecordSetCreate, ich, Common ) {
    'use strict';

    var AwsHostedZoneAppView = ResourceAppView.extend({
        
        template: _.template(awsHostedZoneAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["domain", "id", "description"],
        
        idColumnNumber: 1,
        
        model: HostedZone,
        
        collectionType: HostedZones,
        
        type: "dns",
        
        subtype: "hostedzones",
        
        CreateView: HostedZoneCreate,

        records: undefined,

        selectedRecord: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #record_sets': 'refreshRecordSetsTab',
            'click #create_record_set_button': 'createRecordSet',
            'click #record_set_table tr': 'toggleRecordSetActions',
            'click #record_set_action_menu ul li': 'performRecordSetAction'
        },

        createText: "Create Hosted Zone",

        actions: [
            { text: "Delete Hosted Zone", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.$el.html(this.template);
            this.loadData({ render: true });
            
            var hostedZoneApp = this;
            Common.vent.on("hostedZoneAppRefresh", function() {
                hostedZoneApp.render();
            });
            Common.vent.on("recordSetRefresh", function() {
                hostedZoneApp.refreshRecordSetsTab();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var dns = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Hosted Zone":
                dns.destroy(this.credentialId);
                break;
            }
        },

        refreshRecordSetsTab: function() {
            $("#record_sets_tab").empty();
            //Add button bar
            $("#record_sets_tab").append("<table>" +
                                        "<tr>" +
                                            "<td><button id='create_record_set_button'>Create Record Set</button></td>" +
                                            "<td>" +
                                                "<ul id='record_set_action_menu'>" +
                                                    "<li style='z-index: 1000'><a>Actions</a>" +
                                                        "<ul>" +
                                                            "<li><a>Edit Record Set</a></li>" +
                                                            "<li><a>Delete Record Set</a></li>" +
                                                        "</ul></li>" +
                                                "</ul>" +
                                            "</td>" +
                                        "</tr>" +
                                     "</table>");
            $("#record_set_action_menu li").addClass("ui-state-disabled");
            //Add record set data table
            $("#record_sets_tab").append("<table id='record_set_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr><th style='width:250px;'>Name</th><th style='width:100px;'>Type</th><th>Value</th><th style='width:100px;'>TTL</th></tr>" +
                                        "</thead>" +
                                        "<tbody></tbody>" +
                                    "</table>");
            $("#create_record_set_button").button();
            $("#record_set_action_menu").menu();
            this.$recordSetTable = $('#record_set_table').dataTable({"bJQueryUI": true});
            this.refreshRecordSets();
        },

        refreshRecordSets: function() {
            this.$recordSetTable.fnClearTable();
            this.selectedRecord = undefined;
            $("#record_set_action_menu li").addClass("ui-state-disabled");
            this.records = new RecordSets({"hosted_zone_id": this.selectedId});
            this.records.on( 'reset', this.addAllRecordSets, this );
            this.records.fetch({ data: $.param({ cred_id: this.credentialId}), reset: true });
        },

        addAllRecordSets: function() {
            this.$recordSetTable.fnClearTable();
            this.records.each(function(record) {
                var view = new ResourceRowView({ tableId: "#record_set_table", model: record });
                view.columns = ["Name", "Type", "ResourceRecords", "TTL"];
                view.render();
            });
        },

        createRecordSet: function () {
            var hostedZone = this.collection.get(this.selectedId);
            new RecordSetCreate({cred_id: this.credentialId, hosted_zone: hostedZone});
        },

        toggleRecordSetActions: function(e) {
            this.selectRecord(e);
            //Disable any needed actions
        },
        
        selectRecord: function (event) {
            this.$recordSetTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var rowData = this.$recordSetTable.fnGetData(event.currentTarget);
            this.selectedRecord = new RecordSet({"Name":rowData[0], "Type":rowData[1], "ResourceRecords":rowData[2].split("<br />"), "TTL":rowData[3]});
            if(this.selectedRecord) {
                $("#record_set_action_menu li").removeClass("ui-state-disabled");
            }
        },
        
        performRecordSetAction: function(event) {
            if(this.selectedRecord) {
                var hostedZone = this.collection.get(this.selectedId);
                switch(event.target.text)
                {
                case "Edit Record Set":
                    new RecordSetCreate({cred_id: this.credentialId, hosted_zone: hostedZone, record_set:this.selectedRecord});
                    break;
                case "Delete Record Set":
                    var options = {
                        "hosted_zone_id":hostedZone.attributes.id, 
                        "change_batch":[
                            {
                                "action":"DELETE", 
                                "name":this.selectedRecord.attributes.Name,
                                "type":this.selectedRecord.attributes.Type, 
                                "ttl":this.selectedRecord.attributes.TTL,
                                "resource_records":this.selectedRecord.attributes.ResourceRecords
                            }
                        ]
                    };
                    this.selectedRecord.change(options, this.credentialId);
                    break;
                }
            }
        }
    });

    return AwsHostedZoneAppView;
});
