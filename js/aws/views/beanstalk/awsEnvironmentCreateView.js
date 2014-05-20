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
        'views/dialogView',
        'text!templates/aws/beanstalk/awsEnvironmentCreateTemplate.html',
        'aws/models/beanstalk/awsApplication',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'jquery.form'
        
], function( $, _, Backbone, DialogView, environmentCreateTemplate, Application, Common ) {
    
    var ClusterCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        currentViewIndex: undefined,

        storageSizeMinimum: undefined,

        app: undefined,
 
        events: {
            "dialogclose": "close",
            "click input[name='launch_new']": "environmentEnable"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.app = options.app;
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(environmentCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Environment Create",
                width:650,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            $("#accordion").accordion({ heightStyle: "fill" });
            
            this.populateVersions();
            
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },


        create: function() {
            var newApp = this.app;
            var options = {};
            var issue = false;


            options.ApplicationName = newApp.id;
            options.SolutionStackName = $("#container_type_select").val();
            
            if($("#env_name_input").val().trim() !== "") {
                this.displayValid(true, "#env_name_input");
                options.EnvironmentName = $("#env_name_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#env_name_input");
            }
            
            if($("#env_url_input").val().trim() !== "") {
                options.CNAMEPrefix = $("#env_url_input").val();
            }
            
            if($("#env_desc_input").val().trim() !== "") {
                options.Description = $("#env_desc_input").val();
            }
            
            if($("#version_label_select").val().trim() !== "") {
                options.VersionLabel = $("#version_label_select").val();
            }
            
            options.OptionSettings = [];
            
            if($("#instance_select").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "InstanceType", "Value": $("#instance_select").val()});
            }else{
                issue = true;
            }
            
            if($("#keypair_input").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "EC2KeyName", "Value": $("#keypair_input").val()});
            }
            
            if($("#email_input").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:elasticbeanstalk:sns:topics", "OptionName": "Notification Endpoint", "Value": $("#email_input").val()});
            }
            
            if($("#health_input").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:elasticbeanstalk:application", "OptionName": "Application Healthcheck URL", "Value": $("#health_input").val()});
            }
            
            if($("#profile_select").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "IamInstanceProfile", "Value": $("#profile_select").val()});
            }else{
                issue = true;
            }
            
            if($("#droot_input").val() !== "") {
                options.OptionSettings.push({"Namespace": "aws:elasticbeanstalk:container:php:phpini", "OptionName": "document_root", "Value": $("#droot_input").val()});
            }

            if(!issue) {
                newApp.createEnvironment(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        },
        
        populateVersions: function(){
            var versions = this.app.attributes.version_names;
            $("#version_label_select").empty();
            $.each(versions, function(index, value) {
                var versionData = value;
                $("#version_label_select").append("<option value='"+versionData+"'>"+versionData+"</option>");
            });
        }

    });
    
    return ClusterCreateView;
});
