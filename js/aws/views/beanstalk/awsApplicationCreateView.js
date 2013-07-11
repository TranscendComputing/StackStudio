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
        'text!templates/aws/beanstalk/awsApplicationCreateTemplate.html',
        '/js/aws/models/beanstalk/awsApplication.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'jquery.form'
        
], function( $, _, Backbone, DialogView, applicationCreateTemplate, Application, Common ) {
    
    var ClusterCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        currentViewIndex: undefined,

        storageSizeMinimum: undefined,

        application: new Application(),
        
        doCreateEnvironment: false,
        
        options: undefined,
 
        events: {
            "dialogclose": "close",
            "click input[name='launch_new']": "environmentEnable",
            'click #object_upload_button': 'openFileDialog'
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            
            var createAppView = this;
            Common.vent.on("applicationAppRefresh", function(data) {
                createAppView.asyncCreateEnvironment();
            });
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(applicationCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Application Create",
                width:625,
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
            
            $("#container_type_select").selectmenu();
            $("#instance_select").selectmenu();
            $("#profile_select").selectmenu();
            
            this.environmentEnable();
            $("#object_upload_button").button();
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        environmentEnable: function() {
            if($("input[name='launch_new']:checked").val() === "no_preference") {
                $("#launch_new_options select").attr("disabled", true);
                $("#launch_new_options").addClass("ui-state-disabled");
            }else {
                $("#launch_new_options select").removeAttr("disabled");
                $("#launch_new_options").removeClass("ui-state-disabled");
            }
            $("#launch_new_options select").selectmenu();
        },

        create: function() {
            var newApp = this.application;
            this.options = {};
            
            var issue = false;
            
            var doCreateVersion = false;
            this.doCreateEnvironment = false;


            if($("#app_name_input").val().trim() !== "") {
                this.displayValid(true, "#app_name_input");
                this.options.ApplicationName = $("#app_name_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#app_name_input");
            }
            
            if($("#description_input").val().trim() !== "") {
                this.displayValid(true, "#description_input");
                this.options.Description = $("#description_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#description_input");
            }

          
            
            if($("#app_source_input").val() === "true" && $("#upload_string").html() !== "No file chosen"){
                
                this.options.SourceBundle = {};
                this.options.SourceBundle['S3Bucket'] = "elasticbeanstalk-us-east-1-983391187112";
                this.options.VersionLabel = $("#file_string").html().trim();
                this.options.SourceBundle['S3Key'] = $("#file_string").html().trim();
                
                if($("#env_url_input").val().trim() !== "") {
                    this.options.CNAMEPrefix = $("#env_url_input").val().trim();
                }
                
                doCreateVersion = true;
                
            }
            
            if($("input[name='launch_new']:checked").val() !== "no_preference"){
                //options.VersionLabel = undefined;
                
                if($("#env_name_input").val().trim() !== "") {
                    this.displayValid(true, "#env_name_input");
                    this.options.EnvironmentName = $("#env_name_input").val();
                }else{
                    issue = true;
                    this.displayValid(false, "#env_name_input");
                }
                
                this.options.SolutionStackName = $("#container_type_select").val();
                
                this.options.OptionSettings = [];
    
                if($("#instance_select").val() !== "") {
                    this.options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "InstanceType", "Value": $("#instance_select").val()});
                }else{
                    issue = true;
                }
    
                if($("#keypair_input").val() !== "") {
                    this.options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "EC2KeyName", "Value": $("#keypair_input").val()});
                }
    
                if($("#email_input").val() !== "") {
                    this.options.OptionSettings.push({"Namespace": "aws:elasticbeanstalk:sns:topics", "OptionName": "Notification Endpoint", "Value": $("#email_input").val()});
                }
    
                if($("#health_input").val() !== "") {
                    this.options.OptionSettings.push({"Namespace": "aws:elasticbeanstalk:application", "OptionName": "Application Healthcheck URL", "Value": $("#health_input").val()});
                }
    
                if($("#profile_select").val() !== "") {
                    this.options.OptionSettings.push({"Namespace": "aws:autoscaling:launchconfiguration", "OptionName": "IamInstanceProfile", "Value": $("#profile_select").val()});
                }else{
                    issue = true;
                }
                
                this.doCreateEnvironment = true;
                
            }
            
            if(!issue){
                
                newApp.create(this.options, this.credentialId, this.region);
                if(doCreateVersion) {
                    newApp.createVersion(this.options, this.credentialId, this.region);
                    this.$el.dialog('close');
                }else{
                    this.$el.dialog('close');
                }
                /*
                if(doCreateEnvironment) {
                    options.VersionLabel = undefined
                    newApp.createEnvironment(options, this.credentialId, this.region);
                }
                */
            }
        },
        
        openFileDialog: function() {
            this.refreshFileInputForm();
            var appView = this;
            $("#file_dialog").click();
            $("#file_dialog").change(function() {
                $('#upload_file_form').ajaxForm({
                    beforeSubmit : function() {
                     	var fileName = $('#file_dialog').val();
                        fileName = fileName.replace("C:\\fakepath\\", "");
                        $("#upload_string").html(fileName);
                        $("#file_string").html(fileName);
                    }
                    
                });
                $('#upload_file_form').submit();
                appView.refreshFileInputForm();
            });
        },
        
        refreshFileInputForm: function() {
            $("#upload_file_form").remove();
            $("#upload_string").append("<form id='upload_file_form' style='visibility:hidden' method='post' action='" + Common.apiUrl + "/stackstudio/v1/cloud_management/aws/object_storage/directory/file/upload'>" +
                                        "<input id='file_dialog' name='file_upload' type='file'>" +
                                        "<input name='directory' value='" + "elasticbeanstalk-us-east-1-983391187112" + "'>" +
                                        "<input name='cred_id' value='" + this.credentialId + "'>" +
                                        "<input name='region' value='" + this.region + "'>" +
                                    "</form>");
        },
        
        asyncCreateEnvironment: function() {
            if(this.doCreateEnvironment){
                this.application.createEnvironment(this.options, this.credentialId, this.region);
                this.doCreateEnvironment = false;
            }
        }

    });
    
    return ClusterCreateView;
});
