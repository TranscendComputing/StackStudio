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
        'aws/views/object_storage/awsBucketsAppView',
        'text!templates/google/object_storage/googleBucketAppTemplate.html',
        'google/models/object_storage/googleBucket',
        'google/collections/object_storage/googleBuckets',
        'google/views/object_storage/googleBucketCreateView',
        'google/collections/object_storage/googleFiles',
        'views/resource/resourceRowView',
        'icanhaz',
        'common',
        'jquery.dataTables',
        'jquery.jstree',
        'jquery.form'
], function( $, _, Backbone, AppView, awsBucketAppTemplate, Bucket, Buckets, GoogleBucketCreateView, Files, ResourceRowView, ich, Common ) {
    'use strict';

    // Google Application View
    // ------------------------------

    /**
     * Google AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an GoogleAppView instance.
     */
    var GoogleBucketsAppView = AppView.extend({
        template: _.template(awsBucketAppTemplate),
        
        modelStringIdentifier: "key",
        
        columns: ["key"],
        
        idColumnNumber: 0,
        
        model: Bucket,
        
        collectionType: Buckets,
        
        type: "object_storage",
        
        subtype: "buckets",
        
        CreateView: GoogleBucketCreateView,
        
        files: undefined,
        
        initialObjectLoad: false,
        
        selectedFile: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
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
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            $('#resource_table').dataTable({
                "sDom": 't',
                "bDestroy": true
            });
            
            var objectStorageApp = this;
            Common.vent.on("objectStorageAppRefresh", function() {
                objectStorageApp.render();
            });
            
            Common.vent.on("objectStorageObjectRefresh", function() {
                objectStorageApp.refreshObject();
            });
            
        },
        
        render: function() {
            this.$el.html(this.template);
            $("#resource_app").html(this.$el);
            this.delegateEvents(this.events);
            ich.refresh();
            $('button').button();
            $("#action_menu").menu();

            this.$table = $('#resource_table').dataTable({
                "sDom": 't',
                "bDestroy": true
            });
            this.$table.fnProcessingIndicator(true);

            var CollectionType = this.collectionType;
            this.collection = new CollectionType();
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );
            $("#action_menu li").addClass("ui-state-disabled");

            var view = this;
            // Fetch error callback function is defined here to 
            // ensure variable scopes
            var fetchErrorFunction = function(collection, response, options) {
                view.$table.fnProcessingIndicator(false);
                var status,
                    message;
                if(response.statusText !== "")
                {
                    status = response.statusText;
                }else{
                    status = "Connection Error";
                }
                if(response.responseText !== "")
                {
                    message = response.responseText;
                }else{
                    message = "Unable to connect to server to fetch resources.";
                }
                Common.errorDialog(status, message);
            };
            
            if(view.credentialId && view.region) {
                view.collection.fetch({ 
                    error: fetchErrorFunction,
                    data: $.param({ cred_id: view.credentialId, region: view.region }),
                    reset: true
                });
            }else if(view.credentialId) {
                view.collection.fetch({  
                    error: fetchErrorFunction,
                    data: $.param({ cred_id: view.credentialId }),
                    reset: true 
                });
            }else {
                view.collection.fetch({ 
                    error: fetchErrorFunction,
                    reset: true
                });
            }
            view.setResourceAppHeightify();
        },
        
        refreshObject: function() {
            $("#download_file_form").attr("action", Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directory/file/download");
            
            this.$objectTable.fnClearTable();
            this.selectedFile = undefined;
            $("#object_action_menu li").addClass("ui-state-disabled");
            this.files = new Files({"directory": this.selectedId});
            this.files.on( 'reset', this.addAllFiles, this );
            this.files.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
        },
        
        refreshFileInputForm: function() {
            $("#upload_file_form").remove();
            $("#object_tab").append("<form id='upload_file_form' style='visibility:hidden' method='post' action='" + Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directory/file/upload'>" +
                                        "<input id='file_dialog' name='file_upload' type='file'>" +
                                        "<input name='directory' value='" + this.selectedId + "'>" +
                                        "<input name='cred_id' value='" + this.credentialId + "'>" +
                                        "<input name='region' value='" + this.region + "'>" +
                                    "</form>");
        },
        
        addAll: function() {
            this.$table.fnClearTable();
            this.$table.fnProcessingIndicator(false);
            this.collection.each(this.addOne, this);
            this.setResourceAppHeightify();
            if(this.selectedId) {
                this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
            }
            $('#object_url').trigger('click');
        },
        
        toggleActions: function(e) {
            this.unloadObjectTab();
            //Disable any needed actions
            $('#object_url').trigger('click');
        }
        
    });
    
    return GoogleBucketsAppView;
});
