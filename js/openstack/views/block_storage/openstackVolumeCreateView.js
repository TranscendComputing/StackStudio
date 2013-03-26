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
        'text!templates/openstack/block_storage/openstackVolumeCreateTemplate.html',
        '/js/openstack/collections/block_storage/openstackVolumes.js',
        '/js/openstack/collections/compute/openstackAvailabilityZones.js',
        '/js/openstack/collections/block_storage/openstackSnapshots.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, volumeCreateTemplate, Volumes, AvailabilityZones, Snapshots, ich, Common ) {
	
    /**
     * VolumeCreateView is UI form to create compute.
     *
     * @name VolumeCreateView
     * @constructor
     * @category Volume
     * @param {Object} initialization object.
     * @returns {Object} Returns a VolumeCreateView instance.
     */
	
	var VolumeCreateView = DialogView.extend({
		
		credentialId: undefined,

        region: undefined,
		
		availabilityZones: new AvailabilityZones(),
		
		snapshots: new Snapshots(),
		
		template: _.template(volumeCreateTemplate),
		
		collection: new Volumes(),

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
                title: "Create Volume",
                width:550,
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
            $("#volume_type_select").selectmenu({
                change: function() {
                    createView.volumeTypeChange();
                }
            });
            this.volumeTypeChange();
            $("#az_select").selectmenu();
            $("#snapshot_select").selectmenu();
            
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}) });
            
            this.snapshots.on( 'reset', this.addAllSnapshots, this );
            this.snapshots.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}) });
		},
		
		render: function() {
            
        },
		
		addAllAvailabilityZones: function() {
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.get("name")));
            });
            $("#az_select").selectmenu();
        },
        
        addAllSnapshots: function() {
            this.snapshots.each(function(snapshot) {
                var snapshotText = snapshot.id;
                if(snapshot.hase("description")) {
                    snapshotText = snapshotText + " -- " + snapshot.get("description");
                }
                $("#snapshot_select").append($("<option value="+ snapshot.id +">"+ snapshotText +"</option>"));
            });
            $("#snapshot_select").selectmenu();
        },

		volumeTypeChange: function() {
            if($("#volume_type_select").val() === "standard") {
		        $("#volume_iops").addClass("ui-state-disabled");
		    }else {
		        $("#volume_iops").removeClass();
		    }
		},
		
		create: function() {
            var issue = false,
                size,
                snapshot_id;
            
            //Validate before create
            
            if($("#volume_size_input").val() !== "") {
                var sizeInt = parseInt($("#volume_size_input").val());
                if(sizeInt > 0 && sizeInt < 1001) {
                    size = sizeInt;
                }else {
                    issue = true;
                }
            }else {
                issue = true;
            }
            
            if($("#snapshot_select").val() !== "none") {
                snapshot_id = $("#snapshot_select").val();
            }

		    var newVolume = this.collection.create({
                name: $("#volume_name_input").val(),
                description: $("#volume_description_input").val(),
                size: size,
                availability_zone: $("#az_select").val(),
                snapshot_id: snapshot_id
            });
            
            if(!issue) {
                newVolume.create(this.credentialId, this.region);
                this.$el.dialog('close'); 
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return VolumeCreateView;
});
