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
        'text!templates/openstack/object_storage/openstackBucketAppTemplate.html',
        '/js/openstack/models/object_storage/openstackBucket.js',
        '/js/openstack/collections/object_storage/openstackBuckets.js',
        '/js/openstack/views/object_storage/openstackBucketCreateView.js',
        '/js/openstack/collections/object_storage/openstackFiles.js',
        'views/resource/resourceRowView',
        'icanhaz',
        'common',
        'spinner',
        'jquery.dataTables',
        'jquery.jstree',
        'jquery.form',
        'dataTables.fnReloadAjax',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, AppView, openstackBucketAppTemplate, Bucket, Buckets, OpenstackBucketCreateView, Files, ResourceRowView, ich, Common, Spinner ) {
    'use strict';

    // Openstack Application View
    // ------------------------------

    /**
     * Openstack AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an OpenstackAppView instance.
     */
    var OpenstackBucketsAppView = AppView.extend({
        template: _.template(openstackBucketAppTemplate),
        
        modelStringIdentifier: "key",
        
        columns: ["key"],
        
        idColumnNumber: 0,
        
        model: Bucket,
        
        collectionType: Buckets,
        
        type: "object_storage",
        
        subtype: "buckets",
        
        CreateView: OpenstackBucketCreateView,
        
        initialObjectLoad: false,
        
        selectedFile: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'click #object_upload_button': 'uploadFileDialog',
            'click #object_refresh_button': 'fetchFiles',
            'click #object_table tr': 'toggleObjectActions',
            'click #object_action_menu ul li': 'performObjectAction',
            'change #file_dialog': 'submitFormAction'
        },

        initialize: function(options) {
            var view = this;
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var objectStorageApp = this;
            Common.vent.on("objectStorageAppRefresh", function() {
                objectStorageApp.render();
            });
        },
        
        toggleActions: function(e) {
            this.renderObjectTable();
            this.files = new Files({directoryId: this.selectedId});
            this.files.on("reset", this.refreshTable, this);
            this.files.on("add", this.refreshTable, this);
            this.files.on("destroy", this.refreshTable, this);
            this.files.fetch({data: {cred_id: this.credentialId, region: this.region}, reset: true});
            //Disable any needed actions
        },

        renderObjectTable: function() {
            var view = this;
            this.$("button").button();
            this.$("#object_action_menu").menu();
            $("#object_action_menu li").addClass("ui-state-disabled");
            this.$objectTable = $('#object_table').dataTable({
                "bJQueryUI": true,
                "sDom": "t",
                "aoColumns": [
                    {"sTitle": "Name", "mDataProp": "key"},
                    {"sTitle": "Size", "mDataProp": "size"},
                    {"sTitle": "Last Modified", "mDataProp": "last_modified"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    $("#object_action_menu li").addClass("ui-state-disabled");
                    fnCallback(view.files.toJSON());
                }
            }, view);
        },
        
        performAction: function(event) {
            var directory = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                directory.destroy(this.credentialId, this.region);
                break;
            }
        },

        fetchFiles: function() {
            this.files.fetch({data: {cred_id: this.credentialId, region: this.region}, reset: true});
        },
        
        refreshTable: function() {
            this.$objectTable.fnClearTable();
            this.$objectTable.fnReloadAjax();
        },
        
        uploadFileDialog: function() {
            $("#file_form").remove();
            var appView = this;
            var directory = this.collection.get(this.selectedId);

            // Append hidden form template for file upload
            $("#object_tab").append(ich.file_template());
            // Add ajax form functionality to form
            var formOptions = {
                url: directory.url() + "/files",
                data: {
                    cred_id: appView.credentialId,
                    region: appView.region
                },
                complete: function() {
                    $(".spinner").remove();
                    appView.fetchFiles();
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                },
                success: function(data) {
                    // TODO: Add success handler
                }
            };

            // attach handler to form's submit event 
            $('#file_form').submit(function() {
                var spinnerOptions = {
                    length: 10, // The length of each line
                    width: 8, // The line thickness
                    radius: 5, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9 // The z-index (defaults to 2000000000)
                };
                new Spinner(spinnerOptions).spin($("#object_upload_button").get(0));
                // submit the form
                $(this).ajaxSubmit(formOptions);
                // return false to prevent normal browser submit and page navigation
                return false;
            });
            
            $("#file_dialog").click();
        },

        downloadFile: function() {
            $("#file_form").remove();
            var appView = this;
            var file = this.selectedFile;
            // Append hidden form template for file upload
            var actionUrl = file.url() + "?cred_id=" + appView.credentialId;
            $("#object_tab").append(ich.file_template({download: true, actionUrl: actionUrl}));
            $("#file_form").submit();
        },

        submitFormAction: function() {
            $("#file_form").submit();
            return false;
        },
        
        toggleObjectActions: function(e) {
            this.selectObject(e);
            //Disable any needed actions
        },
        
        selectObject: function (event) {
            this.$objectTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var fileData = this.$objectTable.fnGetData(event.currentTarget);
            this.selectedFile = this.files.get(fileData.key);
            if(this.selectedFile) {
                $("#object_action_menu li").removeClass("ui-state-disabled");
            }
        },
        
        performObjectAction: function(event) {
            if(this.selectedFile) {
                switch(event.target.text)
                {
                case "Delete":
                    this.selectedFile.destroy({data: {cred_id: this.credentialId, region: this.region}});
                    break;
                case "Download":
                    this.downloadFile();
                    break;
                }
            }
        }
        
    });
    
    return OpenstackBucketsAppView;
});
