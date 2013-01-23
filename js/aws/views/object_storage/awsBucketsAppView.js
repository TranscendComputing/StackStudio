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
        '/js/aws/views/object_storage/awsBucketRowView.js',
        '/js/aws/views/object_storage/awsBucketCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsBucketAppTemplate, Bucket, buckets, AwsBucketRowView, AwsBucketCreateView, ich, Common ) {
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
	    
        modelStringIdentifier: "Name",
        
        idRowNumber: 2,
        
        model: Bucket,
        
        collection: buckets,
        
        type: "object_storage",
        
        subtype: "buckets",
        
        CreateView: AwsBucketCreateView,
        
        RowView: AwsBucketRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
            $("#action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            var rowData = this.$table.fnGetData(e.currentTarget);
            if (rowData[3]) {
                console.log($("#action_menu").menu("widget"));
            }
        }
	});
    
	return AwsBucketsAppView;
});
