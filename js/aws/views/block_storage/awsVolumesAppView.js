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
        'text!templates/aws/block_storage/awsVolumeAppTemplate.html',
        '/js/aws/models/block_storage/awsVolume.js',
        '/js/aws/collections/block_storage/awsVolumes.js',
        '/js/aws/views/block_storage/awsVolumeCreateView.js',
        '/js/aws/views/block_storage/awsVolumeAttachView.js',
        '/js/aws/views/block_storage/awsSnapshotCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsVolumeAppTemplate, Volume, Volumes, AwsVolumeCreateView, AwsVolumeAttachView, AwsSnapshotCreateView, ich, Common ) {
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
	var AwsVolumesAppView = AppView.extend({
	    template: _.template(awsVolumeAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["tags.Name", "id", "size", "state"],
        
        idColumnNumber: 1,
        
        model: Volume,
        
        collectionType: Volumes,
        
        type: "block_storage",
        
        subtype: "volumes",
        
        CreateView: AwsVolumeCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var volumeApp = this;
            Common.vent.on("volumeAppRefresh", function() {
                volumeApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var volume = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Volume":
                volume.destroy(this.credentialId);
                break;
            case "Attach Volume":
                new AwsVolumeAttachView({cred_id: this.credentialId, volume: volume});
                break;
            case "Detach Volume":
                volume.detach(this.credentialId);
                break;
            case "Force Detach":
                volume.forceDetach(this.credentialId);
                break;
            case "Create Snapshot":
                new AwsSnapshotCreateView({cred_id: this.credentialId, volume: volume});
                break;
            }
        }
	});
    
	return AwsVolumesAppView;
});
