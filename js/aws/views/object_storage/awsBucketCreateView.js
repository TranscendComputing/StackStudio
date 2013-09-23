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
        'text!templates/aws/object_storage/awsBucketCreateTemplate.html',
        '/js/aws/models/object_storage/awsBucket.js',
        'common'
], function( $, _, Backbone, DialogView, bucketCreateTemplate, Bucket, Common ) {	
	
    /**
     * BucketCreateView is UI form to create compute.
     *
     * @name BucketCreateView
     * @constructor
     * @category Bucket
     * @param {Object} initialization object.
     * @returns {Object} Returns a BucketCreateView instance.
     */
	
	var BucketCreateView = DialogView.extend({

		credentialId: undefined,

        region: undefined,
		
		template: _.template(bucketCreateTemplate),
		
		cloudDefinitions: undefined,
		
		bucket: new Bucket(),

		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
		    this.credentialId = options.cred_id;
            this.region = options.region;
		    var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Bucket",
                width:400,
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
            
            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;
            this.cloudDefinitions = $.parseJSON(response);
            
            $.each(this.cloudDefinitions["aws"].regions, function (index, value) {
                $('#bucket_region_select').append($("<option value="+ value.zone +">"+ value.name +"</option>"));
            });
		},

		render: function() {

		},
		
		create: function() {
			//Validate and create
		    var newBucket = this.bucket,
                options = {},
                issue = false;
		    
		    if($("#bucket_name_input").val() !== "") {
		        options.key = $("#bucket_name_input").val();
		    }else {
		        issue = true;
		    }
		    
		    if(!issue) {
		        newBucket.create(options, this.credentialId, this.region);
		        this.$el.dialog('close');
		    }else {
		        Common.errorDialog("Invalid Request", "Please supply all required fields.");
		    }
		}

	});
    
	return BucketCreateView;
});
