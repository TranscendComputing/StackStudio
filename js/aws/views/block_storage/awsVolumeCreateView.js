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
        'text!templates/aws/block_storage/awsVolumeCreateTemplate.html',
        '/js/aws/models/block_storage/awsVolume.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, volumeCreateTemplate, Volume, ich, Common ) {
	
	var azList = ["us-east-1a", "us-east-1b", "us-east-1d"];
	
	var volumeTypes = ["Standard", "Provisioned IOPS (io1)"];
	
	var snapshots = ["--- No Snapshot ---", "snap-d010f6b9 -- Windows 2003 R2 Installation", "snap-0bdf3f62 -- 2003-2006 Economic Data (Linux)"];
	
    /**
     * VolumeCreateView is UI form to create compute.
     *
     * @name VolumeCreateView
     * @constructor
     * @category Volume
     * @param {Object} initialization object.
     * @returns {Object} Returns a VolumeCreateView instance.
     */
	
	var VolumeCreateView = Backbone.View.extend({
		
		tagName: "div",
		
		template: _.template(volumeCreateTemplate),
		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function() {
			//TODO
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Volume",
                width:500,
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
            
            $.each(azList, function (index, value) {
                $('#az_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#az_select").selectmenu();
           
            $.each(volumeTypes, function (index, value) {
                $('#volume_type_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#volume_type_select").selectmenu();
            
            $.each(snapshots, function (index, value) {
                $('#snapshot_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#snapshot_select").selectmenu();
            
            return this;
		},
		
		close: function() {
			$("#az_select").remove();
			$("#volume_type_select").remove();
			$("#snapshots_select").remove();
			this.$el.dialog('close');
		},
		
		cancel: function() {
			this.$el.dialog('close');
		},
		
		create: function() {
			//Validate and create
			this.$el.dialog('close');
		}

	});
    
	return VolumeCreateView;
});
