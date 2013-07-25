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
        'text!templates/aws/beanstalk/awsVersionCreateTemplate.html',
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

        app: undefined,
 
        events: {
            "dialogclose": "close",
            'click #object_upload_button': 'openFileDialog'
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.app = options.app;
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(applicationCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Version Create",
                width: 400,
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
            
            $("#object_upload_button").button();
            
            $("#app_name").html(this.app.id);
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


            options.ApplicationName = $("#app_name").html();
            
            options.SourceBundle = {};
            options.SourceBundle['S3Bucket'] = $("#s3bucket").html();
            
            
            if($("#description_input").val().trim() !== "") {
                this.displayValid(true, "#description_input");
                options.Description = $("#description_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#description_input");
            }
            
            if($("#version_label_input").val().trim() !== "") {
                this.displayValid(true, "#version_label_input");
                options.VersionLabel = $("#version_label_input").val();
            }else{
                issue = true;
                this.displayValid(false, "#version_label_input");
            }
            
            if($("#s3key").html().trim() !== "") {
                options.SourceBundle['S3Key'] = $("#s3key").html();
            }else{
                issue = true;
            }
            
            

            if(!issue) {
                newApp.createVersion(options, this.credentialId, this.region);
                this.$el.dialog('close');
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
                        $("#s3key").html(fileName);
                        $("#s3bucket").html("elasticbeanstalk-us-east-1-983391187112");
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
