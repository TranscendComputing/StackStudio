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
 
        events: {
            "dialogclose": "close",
            "click input[name='launch_new']": "environmentEnable",
            'click #object_upload_button': 'openFileDialog'
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
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
            
            //$("#instance_select").selectmenu();
            //$("#profile_select").selectmenu();
            
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

        getDurationInMinutes: function(durationString) {
            var durationMinutes = 0;
            switch(durationString)
            {
                case "0.5":
                    durationMinutes = 30;
                    break;
                case "1":
                    durationMinutes = 60;
                    break;
                case "1.5":
                    durationMinutes = 90;
                    break;
                case "2":
                    durationMinutes = 120;
                    break;
                case "2.5":
                    durationMinutes = 150;
                    break;
                case "3":
                    durationMinutes = 180;
                    break;
            }
            return durationMinutes;
        },

        getMaintenanceWindowString: function() {
            var maintWindowString = "";
            if($("input[name='launch_new']:checked").val() === "no_preference") {
                maintWindowString = "No Preference";
            }else {
                maintWindowString = $("#maintenance_start_time_day_select").val() + ":" + $("#maintenance_start_time_hour_select").val() + ":" + $("#maintenance_start_time_minute_select").val() + "-";
                var mwDur = this.getDurationInMinutes($("#maintenance_duration").val());
                var mwMinute = parseInt($("#maintenance_start_time_minute_select").val(), 10);
                var mwHour = parseInt($("#maintenance_start_time_hour_select").val(), 10);
                var mwEndMinute = ((mwMinute + mwDur) % 60);
                var mwEndHour = ((mwHour + Math.floor((mwMinute + mwDur) / 60)) % 24);
                var mwEndDay = $("#maintenance_start_time_day_select").val();
                //Add a day if the duration rolls to the next day
                if((mwHour + (mwMinute + mwDur / 60) / 24) > 1)
                {
                    switch($("#maintenance_start_time_day_select").val())
                    {
                        case "mon":
                            mwEndDay = "tue";
                            break;
                        case "tue":
                            mwEndDay = "wed";
                            break;
                        case "wed":
                            mwEndDay = "thu";
                            break;
                        case "thu":
                            mwEndDay = "fri";
                            break;
                        case "fri":
                            mwEndDay = "sat";
                            break;
                        case "sat":
                            mwEndDay = "sun";
                            break;
                        case "sun":
                            mwEndDay = "mon";
                            break;
                    }
                }
                maintWindowString = maintWindowString + mwEndDay + ":" + this.setTimeString(mwEndHour) + ":" + this.setTimeString(mwEndMinute);
            }
            return maintWindowString;
        },

        setTimeString: function(timeSection) {
            var timeSectionString;
            if(timeSection < 10) {
                timeSectionString = "0" + timeSection.toString();
            }else {
                timeSectionString = timeSection.toString();
            }
            return timeSectionString;
        },

        create: function() {
            var newApp = this.application;
            var options = {};
            var issue = false;


            if($("#app_name_input").val().trim() !== "") {
                this.displayValid(true, "#app_name_input");
                options.ApplicationName = $("#app_name_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#app_name_input");
            }
            
            if($("#description_input").val().trim() !== "") {
                this.displayValid(true, "#description_input");
                options.Description = $("#description_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#description_input");
            }

            if(!issue) {
                
                newApp.create(options, this.credentialId, this.region);
                var a = $("#app_source_input").val();
                var b = $("#file_string").html().trim();
                
                if($("#app_source_input").val() === "true" && $("#upload_string").html() !== "No file chosen"){
                    
                    
                    
                    options.SourceBundle = {};
                    options.SourceBundle['S3Bucket'] = "elasticbeanstalk-us-east-1-983391187112";
                    options.VersionLabel = $("#file_string").html().trim();
                   
            
                    if($("#upload_string").html().trim() !== "") {
                        options.SourceBundle['S3Key'] = $("#file_string").html().trim();
                    }else{
                        issue = true;
                    }
                    if($("#env_url_input").val().trim() !== "") {
                        options.CNAMEPrefix = $("#env_url_input").val().trim();
                    }
                    
                    newApp.createVersion(options, this.credentialId, this.region);
                    if($("input[name='launch_new']:checked").val() !== "no_preference" && $("#env_name_input").val().trim() !== ""){
                        options.VersionLabel = undefined;
                        
                        
                        options.EnvironmentName = $("#env_name_input").val();
                        
                        options.SolutionStackName = $("#container_type_select").val();
                        
                        newApp.createEnvironment(options, this.credentialId, this.region);
                        
                        //debugger
                    }
                    
                }
                this.$el.dialog('close');
                
            }
        },
        
        openFileDialog: function() {
            //alert("upload file");
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
                     	//debugger
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
        }

    });
    
    return ClusterCreateView;
});
