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
        'views/featureNotImplementedView',
        'views/resource/resourceAppView',
        'text!templates/aws/beanstalk/awsApplicationAppTemplate.html',
        '/js/aws/models/beanstalk/awsApplication.js',
        '/js/aws/collections/beanstalk/awsApplications.js',
        '/js/aws/views/beanstalk/awsApplicationCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, FeatureNotImplementedView, ResourceAppView, awsApplicationAppTemplate, Application, Applications, AwsApplicationCreate, ich, Common ) {
    'use strict';

    var AwsBeanstalkAppView = ResourceAppView.extend({

        template: _.template(awsApplicationAppTemplate),
        
        modelStringIdentifier: "name",
        
        columns: ["name", "created_at", "updated_at"],
        
        idColumnNumber: 0,
        
        model: Application,
        
        collectionType: Applications,
        
        type: "beanstalk",
        
        subtype: "applications",
        
        CreateView: AwsApplicationCreate,
        
        reselectTab: true,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'change #version_select': 'selectVersion',
            'click #environments' : 'refreshEnvironmentsTab',
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
            Common.vent.on("versionsRefresh", function(data) {
                applicationApp.addVersions(data);
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            if(this.reselectTab) {
                this.refreshEnvironmentsTab();
                $("#detail_tabs").tabs("select", this.selectedTabIndex);
                this.reselectTab = true;
            }
        },
        
        refreshEnvironmentsTab: function() {
            $("#environments_tab_content").empty();
            $("#environments_tab_content").append("<span><b>Environments:</b></span><button id='add_environment_button'>Add Environment</button><br /><br />" +
                                    "<table id='environments_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr>" +
                                                "<th>Environment</th><th>URL</th><th>Running Version</th><th>Container Type</th><th>Changed On</th>" +
                                            "</tr>" +
                                        "</thead>" +
                                        "<tbody></tbody><tfoot></tfoot>" +
                                    "</table>");
            $("#environments_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#add_environment_button").button();
            
            $("#environments_tab_content").append("<span><b>Versions:</b></span><button id='add_version_button'>Add Version</button><br /><br />" +
                                    "<table id='versions_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr>" +
                                                "<th>Version Label</th><th>Description</th><th>Created On</th><th>Location</th>" +
                                            "</tr>" +
                                        "</thead>" +
                                        "<tbody></tbody><tfoot></tfoot>" +
                                    "</table>");
            $("#versions_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#add_version_button").button();

            var application = this.collection.get(this.selectedId);
            application.getEnvironments(this.credentialId, this.region);
            application.getVersions(this.credentialId, this.region);
        },
        
        performAction: function(event) {
            var application = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Application":
                application.destroy(this.credentialId, this.region);
                break;
            }
        },
        
        selectVersion: function(e){
            $("#version_detail").append("These are the version details.");
        },
        
        addEnvironments: function(data){
            
           var environments = data.data.body.DescribeEnvironmentsResult.Environments;
           
           $("#environments_table").dataTable().fnClearTable();
           $.each(environments, function(index, value) {
               var environmentData = [value.EnvironmentName,value.CNAME, value.VersionLabel, value.SolutionStackName, value.DateUpdated];
               $("#environments_table").dataTable().fnAddData(environmentData);
           });
           
        },
        
        addVersions: function(data){
            //debugger
           var versions = data.data.body.DescribeApplicationVersionsResult.ApplicationVersions;
           
           $("#versions_table").dataTable().fnClearTable();
           $.each(versions, function(index, value) {
               //debugger
               var versionData = [value.VersionLabel,value.Description, value.DateCreated, value.SourceBundle.S3Key];
               $("#versions_table").dataTable().fnAddData(versionData);
           });
           
        }
    });
    
    return AwsBeanstalkAppView;
});
