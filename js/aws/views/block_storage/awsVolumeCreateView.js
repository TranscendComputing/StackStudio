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
        'text!templates/aws/block_storage/awsVolumeCreateTemplate.html',
        '/js/aws/models/block_storage/awsVolume.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        '/js/aws/collections/block_storage/awsSnapshots.js',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, volumeCreateTemplate, Volume, AvailabilityZones, Snapshots, ich, Common ) {
	
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
		
		ownedSnapshots: new Snapshots(),
		
		publicSnapshots: new Snapshots(),
		
		template: _.template(volumeCreateTemplate),
		
		volume: new Volume(),

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
            $("#volume_type_select").change(function() {
                createView.volumeTypeChange();
            });
            this.volumeTypeChange();
            
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.ownedSnapshots.on( 'reset', this.addAllOwnedSnapshots, this );
            this.ownedSnapshots.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region}),
                reset: true
            });
            
            this.publicSnapshots.on( 'reset', this.addAllPublicSnapshots, this );
            this.publicSnapshots.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"RestorableBy":"all"}}),
                reset: true
            });
		},
		
		render: function() {
            
        },
		
		addAllAvailabilityZones: function() {
            $("#az_select").empty();
            this.availabilityZones.each(function(az) {
                $("#az_select").append($("<option></option>").text(az.attributes.zoneName));
            });
        },
        
        addAllOwnedSnapshots: function() {
            this.ownedSnapshots.each(function(ownedSnapshot) {
                var snapshotText = ownedSnapshot.attributes.id;
                if(ownedSnapshot.attributes.description) {
                    snapshotText = snapshotText + " -- " + ownedSnapshot.attributes.description;
                }
                $("#snapshot_select").append($("<option value="+ ownedSnapshot.attributes.id +">"+ snapshotText +"</option>"));
            });
        },
        
        addAllPublicSnapshots: function() {
            this.publicSnapshots.each(function(publicSnapshot) {
                var snapshotText = publicSnapshot.attributes.id;
                if(publicSnapshot.attributes.description) {
                    snapshotText = snapshotText + " -- " + publicSnapshot.attributes.description;
                }
                $("#snapshot_select").append($("<option value="+ publicSnapshot.attributes.id +">"+ snapshotText +"</option>"));
            });
        },

		volumeTypeChange: function() {
		    if($("#volume_type_select").val() === "standard") {
		        $("#volume_iops").addClass("ui-state-disabled");
		    }else {
		        $("#volume_iops").removeClass();
		    }
		},
		
		create: function() {
		    var newVolume = this.volume;
            var options = {};
            var issue = false;
            //Validate before create
            if($("#volume_name_input").val() !== "") {
                options.tags = {"Name": $("#volume_name_input").val()};
            }
            
            if($("#volume_size_input").val() !== "") {
                var sizeInt = parseInt($("#volume_size_input").val(), 10);
                if(sizeInt > 0 && sizeInt < 1001) {
                    options.size = sizeInt;
                }else {
                    issue = true;
                }
            }else {
                issue = true;
            }
            
            if($("#volume_type_select").val() === "io1") {
                if($("#volume_iops_input").val() !== "") {
                    var iopsInt = parseInt($("#volume_iops_input").val(), 10);
                    if(iopsInt > 99 && iopsInt < 2001) {
                        options.type = $("#volume_type_select").val();
                        options.iops = iopsInt;
                    }else {
                        issue = true;
                    }
                }else {
                    issue = true;
                }
            }
            
            options.availability_zone = $("#az_select").val();
            if($("#snapshot_select").val() !== "none") {
                options.snapshot_id = $("#snapshot_select").val();
            }
            
            if(!issue) {
                newVolume.create(options, this.credentialId, this.region);
                this.$el.dialog('close'); 
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return VolumeCreateView;
});
