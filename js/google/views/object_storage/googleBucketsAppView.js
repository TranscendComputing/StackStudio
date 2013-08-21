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
        '/js/aws/views/object_storage/awsBucketsAppView.js',
        'text!templates/aws/object_storage/awsBucketAppTemplate.html',
        '/js/google/models/object_storage/googleBucket.js',
        '/js/google/collections/object_storage/googleBuckets.js',
        '/js/aws/views/object_storage/awsBucketCreateView.js',
        '/js/google/collections/object_storage/googleFiles.js',
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
        
        refreshObject: function() {
            $("#download_file_form").attr("action", Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directory/file/download");
            
            this.$objectTable.fnClearTable();
            this.selectedFile = undefined;
            $("#object_action_menu li").addClass("ui-state-disabled");
            this.files = new Files({"directory": this.selectedId});
            this.files.on( 'reset', this.addAllFiles, this );
            this.files.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
        }
        
    });
    
    return GoogleBucketsAppView;
});
