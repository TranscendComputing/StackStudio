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
        'views/resourceAppView',
        'text!templates/aws/object_storage/awsBucketAppTemplate.html',
        '/js/aws/models/object_storage/awsBucket.js',
        '/js/aws/collections/object_storage/awsBuckets.js',
        '/js/aws/views/object_storage/awsBucketCreateView.js',
        '/js/aws/collections/object_storage/awsFiles.js',
        'views/resourceRowView',
        'icanhaz',
        'common',
        'jquery.dataTables',
        'jquery.jstree',
        'jquery.form'
], function( $, _, Backbone, AppView, awsBucketAppTemplate, Bucket, Buckets, AwsBucketCreateView, Files, ResourceRowView, ich, Common ) {
	'use strict';

	// Aws Application View
	// ------------------------------

    /**
     * Aws AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an AwsAppView instance.
     */
	var AwsBucketsAppView = AppView.extend({
	    template: _.template(awsBucketAppTemplate),
	    
        modelStringIdentifier: "key",
        
        columns: ["key"],
        
        idColumnNumber: 0,
        
        model: Bucket,
        
        collectionType: Buckets,
        
        type: "object_storage",
        
        subtype: "buckets",
        
        CreateView: AwsBucketCreateView,
        
        files: undefined,
        
        initialObjectLoad: false,
        
        selectedFile: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'toggleActions',
            'click #objects': 'loadObjectTab',
            'click #object_refresh_button': 'refreshObject',
            'click #object_upload_button': 'openFileDialog',
            'click #object_table tr': 'toggleObjectActions',
            'click #object_action_menu ul li': 'performObjectAction'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var objectStorageApp = this;
            Common.vent.on("objectStorageAppRefresh", function() {
                objectStorageApp.render();
            });
            
            Common.vent.on("objectStorageObjectRefresh", function() {
                objectStorageApp.refreshObject();
            });
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            this.unloadObjectTab();
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var directory = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                directory.destroy(this.credentialId);
                break;
            }
        },
        
        loadObjectTab: function() {
            if(!this.initialObjectLoad) {
                //Add button bar
                $("#object_tab").append("<table>" +
                		                    "<tr>" +
                		                        "<td><button id='object_refresh_button'>Refresh Object</button></td>" +
                		                        "<td><button id='object_upload_button'>Upload Object</button></td>" +
                		                        "<td>" +
                		                            "<ul id='object_action_menu'>" +
                		                                "<li style='z-index: 1000'><a id='action_button'>Actions</a>" +
                		                                    "<ul>" +
                		                                        "<li><a>Delete</a></li>" +
                		                                        "<li><a>Download</a></li>" +
                		                                    "</ul></li>" +
                		                            "</ul>" +
                		                        "</td>" +
                		                    "</tr>" +
                		                 "</table>");
                $("#object_action_menu li").addClass("ui-state-disabled");
                //Add place holder for upload progress bar
                //$("#object_tab").append("<div id='upload_progress_bar'></div>");
                //Add objects data table
                $("#object_tab").append("<table id='object_table' class='full_width'>" +
                                    		"<thead>" +
                                    		    "<tr><th>Name</th><th style='width:150px;'>Size</th><th style='width:150px;'>Last Modified</th></tr>" +
                                    		"</thead>" +
                                    		"<tbody></tbody>" +
                                		"</table>");
                //Add hidden form for file upload
                this.refreshFileInputForm();
                //Add hidden form for file download
                $("#object_tab").append("<form id='download_file_form' style='visibility:hidden' method='post' action='" + Common.apiUrl + "/stackstudio/v1/cloud_management/aws/object_storage/directory/file/download'>" +
                        "<input id='download_file_name' name='file' value=''/>" +
                        "<input name='directory' value='" + this.selectedId + "'/>" +
                        "<input name='cred_id' value='" + this.credentialId + "'/>" +
                    "</form>");
                $("#object_refresh_button").button();
                $("#object_upload_button").button();
                $("#object_action_menu").menu();
                this.$objectTable = $('#object_table').dataTable({"bJQueryUI": true});
                this.refreshObject();
                this.initialObjectLoad = true;
            }
        },
        
        unloadObjectTab: function() {
            if(this.initialObjectLoad) {
                $("#object_refresh_button").remove();
                $("#object_upload_button").remove();
                $("#object_action_menu").remove();
                $('#object_table').remove();
                this.initialObjectLoad = false;
            }
        },
        
        addAllFiles: function() {
            this.$objectTable.fnClearTable();
            this.files.each(function(file) {
                var view = new ResourceRowView({ tableId: "#object_table", model: file });
                view.columns = ["key", "content_length", "last_modified"];
                view.render();
            });
        },
        
        refreshObject: function() {
            this.$objectTable.fnClearTable();
            this.selectedFile = undefined;
            $("#object_action_menu li").addClass("ui-state-disabled");
            this.files = new Files();
            this.files.on( 'reset', this.addAllFiles, this );
            this.files.fetch({ data: $.param({ cred_id: this.credentialId, directory: this.selectedId}) });
        },
        
        openFileDialog: function() {
            var appView = this;
            $("#file_dialog").click();
            $("#file_dialog").change(function() {
                /* Attempt at having progress bar for upload
                $("#upload_progress_bar").append("<div class='progress'><div class='bar'><div class='percent'>0%</div></div></div>");
                $('#upload_file_form').ajaxForm({
                    beforeSend: function() {
                        var percentVal = '0%';
                        $(".bar").width(percentVal)
                        $("percent").html(percentVal);
                    },
                    uploadProgress: function(event, position, total, percentComplete) {
                        var percentVal = percentComplete + '%';
                        $(".bar").width(percentVal)
                        $("percent").html(percentVal);
                    },
                    complete: function(xhr) {
                        appView.fileUploadComplete();
                    }
                });
                */
                $('#upload_file_form').ajaxForm({
                    complete: function() {
                        appView.refreshObject();
                    }
                });
                $('#upload_file_form').submit();
                appView.refreshFileInputForm();
            });
        },

        refreshFileInputForm: function() {
            $("#upload_file_form").remove();
            $("#object_tab").append("<form id='upload_file_form' style='visibility:hidden' method='post' action='" + Common.apiUrl + "/stackstudio/v1/cloud_management/aws/object_storage/directory/file/upload'>" +
                                        "<input id='file_dialog' name='file_upload' type='file'>" +
                                        "<input name='directory' value='" + this.selectedId + "'>" +
                                        "<input name='cred_id' value='" + this.credentialId + "'>" +
                                    "</form>");
        },
        
        fileUploadComplete: function() {
            $(".progress").remove();
        },
        
        toggleObjectActions: function(e) {
            this.selectObject(e);
            //Disable any needed actions
        },
        
        selectObject: function (event) {
            this.$objectTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var rowData = this.$objectTable.fnGetData(event.currentTarget);
            this.selectedFile = this.files.get(rowData[0]);
            if(this.selectedFile) {
                $("#object_action_menu li").removeClass("ui-state-disabled");
            }
        },
        
        performObjectAction: function(event) {
            if(this.selectedFile) {
                switch(event.target.text)
                {
                case "Delete":
                    this.selectedFile.destroy(this.selectedId, this.credentialId);
                    break;
                case "Download":
                    $("#download_file_name").attr("value", this.selectedFile.attributes.key);
                    $("#download_file_form").submit();
                    break;
                }
            }
        }
        
	});
    
	return AwsBucketsAppView;
});
