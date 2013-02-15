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
        'icanhaz',
        'common',
        'jquery.dataTables',
        'jquery.jstree'
], function( $, _, Backbone, AppView, awsBucketAppTemplate, Bucket, Buckets, AwsBucketCreateView, ich, Common ) {
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
        
        contents: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            console.log($(e.currentTarget).data());
            var rowData = $(e.currentTarget).data();
            var bucketContents = rowData.Contents;
            var treeData = [];
            $.each(bucketContents, function(index, item) {
                $.each(item, function(property, value) {
                    if (property === "Key") {
                        treeData.push({
                            "data": {
                                "title": value 
                            }
                        });    
                    }
                });
            });
            $("#bucket_contents").jstree({ 
                // List of active plugins
                "plugins" : [ 
                    "json_data", "crrm", "themeroller"
                ],
                
                "core": {
                    "animation": 0
                 },
                 
                 "json_data": {
                     "data": treeData
                 },
                
                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });
        }
	});
    
	return AwsBucketsAppView;
});
