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
        
        envId: undefined,
 
        events: {
            "dialogclose": "close",
            "click input[name='launch_new']": "environmentEnable"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.app = options.app;
            this.envId = options.envId;
            
            var applicationApp = this;
            Common.vent.on("envRefresh", function(data) {
                applicationApp.addEnvData(data);
            });
            Common.vent.on("configRefresh", function(data) {
                applicationApp.addEnvConfigData(data);
            });
        },

        render: function() {
            var modifyView = this;
            var compiledTemplate = _.template(environmentCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Environment Modify",
                width:650,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Modify: function () {
                        modifyView.modify();
                    },
                    Cancel: function() {
                        modifyView.cancel();
                    }
                }
            });
            $("#accordion").accordion({ heightStyle: "fill" });
            
            $("#env_name_input").prop('disabled', true);
            $("#env_name_input").addClass("ui-state-disabled");
            $("#env_url_input").prop('disabled', true);
            $("#env_url_input").addClass("ui-state-disabled");
            
            $("#container_type_select").prop('disabled', true);
            $("#container_type_select").addClass("ui-state-disabled");
            
            var application = this.app;
            this.populateVersions();
            application.describeEnv(this.envId,this.credentialId, this.region);
            application.describeEnvConfig(this.envId,this.credentialId, this.region);
            
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },


        modify: function() {
            var newApp = this.app;
            var options = {};
            var issue = false;


            options.ApplicationName = newApp.id;
            options.SolutionStackName = $("#container_type_select").val();
            
            
            if($("#env_name_input").val().trim() !== "") {
                options.EnvironmentName = $("#env_name_input").val();
            }else{
                issue = true;
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
                newApp.updateEnvironment(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        },
        
        addEnvData: function(data){
            $("#env_name_input").val(data.name);
            
            var s = data.cname;
            s = s.substring(0, s.indexOf('.'));
            $("#env_url_input").val(s);
            
            $("#env_desc_input").val(data.description);
            if(data.version_label){
            $("#version_label_select").val(data.version_label);
            }
            $("#container_type_select").val(data.solution_stack_name);
        },
        
        addEnvConfigData: function(data){
            var optSets = data.data.body.DescribeConfigurationSettingsResult.ConfigurationSettings[0].OptionSettings;
            $.each(optSets, function(index, opt) {
                if(opt.OptionName === "InstanceType"){
                    $("#instance_select").val(opt.Value);
                }else if(opt.OptionName === "EC2KeyName"){
                    $("#keypair_input").val(opt.Value);
                }else if(opt.OptionName === "Notification Endpoint"){
                    $("#email_input").val(opt.Value);
                }else if(opt.OptionName === "Application Healthcheck URL"){
                    $("#health_input").val(opt.Value);
                }else if(opt.OptionName === "IamInstanceProfile"){
                    $("#profile_select").val(opt.Value);
                }else if(opt.OptionName === "document_root"){
                    $("#droot_input").val(opt.Value);
                }
            });
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
