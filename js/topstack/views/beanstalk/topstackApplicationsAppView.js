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
        'text!templates/aws/beanstalk/awsApplicationAppTemplate.html',
        'topstack/models/beanstalk/topstackApplication',
        'topstack/collections/beanstalk/topstackApplications',
        'aws/views/beanstalk/awsApplicationCreateView',
        'aws/views/beanstalk/awsVersionCreateView',
        'aws/views/beanstalk/awsEnvironmentCreateView',
        'aws/views/beanstalk/awsEnvironmentModifyView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsApplicationAppTemplate, Application, Applications, AwsApplicationCreate, AwsVersionCreate, AwsEnvironmentCreate, AwsEnvironmentModify, ich, Common ) {
    'use strict';

    var TopstackBeanstalkAppView = ResourceAppView.extend({

        template: _.template(awsApplicationAppTemplate),
        
        modelStringIdentifier: "name",
        
        columns: ["name", "created_at", "updated_at"],
        
        idColumnNumber: 0,
        
        model: Application,
        
        collectionType: Applications,
        
        type: "beanstalk",
        
        subtype: "applications",
        
        CreateView: AwsApplicationCreate,
        
        VersionCreateView: AwsVersionCreate,
        
        EnvironmentCreateView: AwsEnvironmentCreate,
        
        EnvironmentModifyView: AwsEnvironmentModify,
        
        selectedEnvironment: undefined,
        
        selectedVersion: undefined,
        
        reselectTab: true,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'click #environments' : 'refreshEnvironmentsTab',
            'click #events' : 'refreshEventsTab',
            'click #environments_table tr': 'toggleEnvironmentActions',
            'click #environment_action_menu ul li': 'performEnvironmentAction',
            'click #versions_table tr': 'toggleVersionActions',
            'click #version_action_menu ul li': 'performVersionAction'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            
            this.render();
            
            var applicationApp = this;
            Common.vent.on("applicationAppRefresh", function() {
                applicationApp.render();
            });
            Common.vent.on("environmentsRefresh", function(data) {
                applicationApp.addEnvironments(data);
            });
            Common.vent.on("eventsRefresh", function(data) {
                applicationApp.addEvents(data);
            });
            Common.vent.on("versionsRefresh", function(data) {
                applicationApp.addVersions(data);
            });
            Common.vent.on("newVersion", function(data) {
                applicationApp.refreshEnvironmentsTab();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            //debugger
            if(this.reselectTab) {
                this.refreshEnvironmentsTab();
                //$("#detail_tabs").tabs("select", this.selectedTabIndex);
                $("#detail_tabs").tabs("select", 0);
                this.reselectTab = true;
            }
            /*if(this.selectedTabIndex === 1){
               this.refreshEventsTab();
            }*/
        },
        
        refreshEnvironmentsTab: function() {
            $("#environments_tab_content").empty();
            $("#environments_tab_content").append("<table>" +
                                        "<tr>" +
                                            "<td><button id='add_version_button'>Add Version</button></td>" +
                                            "<td>" +
                                                "<ul id='version_action_menu'>" +
                                                    "<li style='z-index: 1000'><a id='action_button'>Actions</a>" +
                                                        "<ul>" +
                                                            "<li><a>Delete</a></li>" +
                                                        "</ul></li>" +
                                                "</ul>" +
                                            "</td>" +
                                        "</tr>" +
                                     "</table><br />");
            $("#version_action_menu").menu();
            $("#version_action_menu li").addClass("ui-state-disabled");
            $("#environments_tab_content").append("<table id='versions_table' class='full_width'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>Version Label</th><th>Description</th><th>Created On</th><th>Location</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>");
            this.$versionTable = $("#versions_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            var current = this;
            $("#add_version_button").button().click(function( event ) {
                current.createVersion();
            });
            
            $("#environments_tab_content").append("<table>" +
                                        "<tr>" +
                                            "<td><button id='add_environment_button'>Add Environment</button></td>" +
                                            "<td>" +
                                                "<ul id='environment_action_menu'>" +
                                                    "<li style='z-index: 1000'><a id='action_button'>Actions</a>" +
                                                        "<ul>" +
                                                            "<li><a>Modify</a></li>" +
                                                            "<li><a>Delete</a></li>" +
                                                        "</ul></li>" +
                                                "</ul>" +
                                            "</td>" +
                                        "</tr>" +
                                     "</table><br />");
            $("#environment_action_menu").menu();
            $("#environment_action_menu li").addClass("ui-state-disabled");
            $("#environments_tab_content").append("<table id='environments_table' class='full_width'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>Environment</th><th>URL</th><th>Running Version</th><th>Container Type</th><th>Changed On</th><th>Status</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>");
            this.$environmentTable = $("#environments_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#add_environment_button").button().click(function( event ) {
                current.createEnvironment();
            });
            var application = this.collection.get(this.selectedId);
            application.getEnvironments(this.credentialId, this.region);
            application.getVersions(this.credentialId, this.region);
        },
        
        refreshEventsTab: function() {
            $("#events_tab_content").empty();
            //"<span><b>Environments:</b></span><button id='add_environment_button'>Add Environment</button><br /><br />" +
            $("#events_tab_content").append("<table>" +
                                        "<tr>" +
                                            "<td><button id='refresh_button'>Refresh</button></td>" +
                                        "</tr>" +
                                     "</table><br />");
            $("#events_tab_content").append("<table id='events_table' class='full_width'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>Event Time</th><th>Event Type</th><th>Event Details</th><th>Environment</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>");
            
            this.$eventTable = $("#events_table").dataTable({
                "bJQueryUI": true,
                //"aoColumns": [{ "asSorting": ["desc"] },null,null,null]
            });
            this.$eventTable.fnSort( [ [0,'desc'] ] );
            
            var current = this;
            $("#refresh_button").button().click(function( event ) {
                current.refreshEventsTab();
            });
            

            var application = this.collection.get(this.selectedId);
            application.getEvents(this.credentialId, this.region);
        },
        
        performAction: function(event) {
            var application = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Application":
                application.destroy(this.credentialId, this.region);
                this.toggleActions();
                break;
            }
        },
        
        addEnvironments: function(data){
            
           var environments = data.data.body.DescribeEnvironmentsResult.Environments;
           
           $("#environments_table").dataTable().fnClearTable();
           $.each(environments, function(index, value) {
               //debugger
               if(value.VersionLabel === undefined){
                   value.VersionLabel = "Not Defined";
               }
               if(value.CNAME === undefined){
                   value.CNAME = "Not Defined";
               }
               var environmentData = [value.EnvironmentName,'<a href="http://'+value.CNAME+'">http://'+value.CNAME+'</a>', value.VersionLabel, value.SolutionStackName, value.DateUpdated, value.Status];
               $("#environments_table").dataTable().fnAddData(environmentData);
           });
           
        },
        
        addEvents: function(data){
           var events = data.data.body.DescribeEventsResult.Events;
           
           $("#events_table").dataTable().fnClearTable();
           for(var i = events.length-1; i >= 0; i--){
               var value = events[i];
               if(value.EnvironmentName){
                   var env = value.EnvironmentName;
               }else{
                   var env = "app";
               }
               var eventData = [value.EventDate,value.Severity, value.Message, env];
               $("#events_table").dataTable().fnAddData(eventData);
           }
           
        },
        
        addVersions: function(data){
           var versions = data.data.body.DescribeApplicationVersionsResult.ApplicationVersions;
           
           $("#versions_table").dataTable().fnClearTable();
           $.each(versions, function(index, value) {
               //debugger
               var versionData = [value.VersionLabel,value.Description, value.DateCreated, value.SourceBundle.S3Key];
               $("#versions_table").dataTable().fnAddData(versionData);
           });
        },
            
        createVersion: function(){
            var application = this.collection.get(this.selectedId);
            
            var VersionCreateView = this.VersionCreateView;
            if(this.region) {
                this.newResourceDialog = new VersionCreateView({cred_id: this.credentialId, region: this.region, app: application});
            }else {
                this.newResourceDialog = new VersionCreateView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        },
        
        createEnvironment: function(){
            var application = this.collection.get(this.selectedId);
            
            var EnvironmentCreateView = this.EnvironmentCreateView;
            if(this.region) {
                this.newResourceDialog = new EnvironmentCreateView({cred_id: this.credentialId, region: this.region, app: application});
            }else {
                this.newResourceDialog = new EnvironmentCreateView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        },
        
        toggleEnvironmentActions: function(e){
            this.selectEnvironment(e);
        },
        
        selectEnvironment: function(event){
            this.$environmentTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var rowData = this.$environmentTable.fnGetData(event.currentTarget);
            this.selectedEnvironment = rowData[0];
            if(this.selectedEnvironment) {
                $("#environment_action_menu li").removeClass("ui-state-disabled");
            }
        },
        
        performEnvironmentAction: function(event){
            if(this.selectedEnvironment) {
                switch(event.target.text)
                {
                case "Delete":
                    var application = this.collection.get(this.selectedId);
                    application.destroyEnvironment(this.selectedEnvironment,this.credentialId,this.region);
                    break;
                case "Modify":
                    var application = this.collection.get(this.selectedId);
            
                    var EnvironmentModifyView = this.EnvironmentModifyView;
                    if(this.region) {
                        this.newResourceDialog = new EnvironmentModifyView({cred_id: this.credentialId, region: this.region, app: application, envId: this.selectedEnvironment});
                    }else {
                        this.newResourceDialog = new EnvironmentModifyView({cred_id: this.credentialId});
                    }
                    this.newResourceDialog.render();
                    
                    break;
                }
            }
        },
        
        toggleVersionActions: function(e){
            this.selectVersion(e);
        },
        
        selectVersion: function(event){
            this.$versionTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var rowData = this.$versionTable.fnGetData(event.currentTarget);
            this.selectedVersion = rowData[0];
            if(this.selectedVersion) {
                $("#version_action_menu li").removeClass("ui-state-disabled");
            }
        },
        
        performVersionAction: function(event){
            if(this.selectedVersion) {
                switch(event.target.text)
                {
                case "Delete":
                    var application = this.collection.get(this.selectedId);
                    application.destroyVersion(this.selectedVersion,this.credentialId,this.region);
                    break;
                }
            }
        }
        
    });
    
    return TopstackBeanstalkAppView;
});
