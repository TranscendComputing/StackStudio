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
        'views/volume/volumeAppView',
        'text!templates/aws/volume/awsVolumeAppTemplate.html',
        '/js/aws/models/volume/awsVolume.js',
        '/js/aws/views/volume/awsVolumeRowView.js',
        '/js/aws/views/volume/awsVolumeCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsAppTemplate, Volume, AwsRowView, AwsCreateView, ich, Common ) {
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
	var AwsAppView = AppView.extend({
	    
	    events: {
			'click .create_button': 'createNew',
			'click .resource_table tbody': 'clickOne'
		},

		initialize: function() {
		    //Initialize the template
			var compiledTemplate = _.template(awsAppTemplate);
            this.$el.html(compiledTemplate);
            ich.refresh();
            
			$('.create_button').button();
            this.$table = $('.resource_table').dataTable({"bJQueryUI": true});
            
            //Add listeners for handling collection data
			this.collection.on( 'add', this.addOne, this );
			this.collection.on( 'reset', this.addAll, this );
			this.collection.on( 'all', this.render, this );

			// Fetch will pull results from the server
			this.collection.fetch();
		},
		
		clickOne: function (e) {
            var itemId, parentNode;
            console.log("event:", e);
            parentNode = e.target.parentNode;
            
            // Find the second column of the clicked row; that's item ID
            itemId = $(parentNode).find(':nth-child(2)').html();
            
            //Update URL
            Common.router.navigate("#resources/aws/volume/"+ itemId, {trigger: false});
            
            //Select Item
            this.selectOne(itemId, parentNode);
        },

		createNew : function () {
			var createForm = new AwsCreateView();
			createForm.render();
		}
	});
    
	return AwsAppView;
});
