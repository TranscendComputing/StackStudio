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
        'text!templates/openstack/block_storage/openstackVolumeAttachTemplate.html',
        '/js/openstack/collections/compute/openstackInstances.js',
        'common',
        'jquery.ui.selectmenu' 
], function( $, _, Backbone, DialogView, volumeAttachTemplate, Instances, Common ) {
    
    /**
     * InstanceCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeCreateView instance.
     */
    
    var VolumeAttachView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        volume: undefined,
        
        instances: new Instances(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.volume = options.volume;
            var attachView = this;
            var compiledTemplate = _.template(volumeAttachTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Attach Volume",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Attach: function () {
                        attachView.attach();
                    },
                    Cancel: function() {
                        attachView.cancel();
                    }
                }
            });
            var volumeName = "";
            if(this.volume.has("name")) {
                volumeName = " (" + this.volume.get("name") + ")";
            }
            $("#volume_display").text(this.volume.get("id") + volumeName + " in " + this.volume.get("availability_zone"));
            $("#instance_zone_message").text("in " + this.volume.get("availability_zone"));
            $("#instance_select").selectmenu();
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ 
                data: $.param({ cred_id: this.credentialId, region: this.region, filters: {"availability-zone": this.volume.get("availability_zone")}}),
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
            $("#az_select").selectmenu();
        },
        
        addAllInstances: function() {
            $("#instance_select").empty();
            this.instances.each(function(instance) {
                $("#instance_select").append($("<option data-id="+ instance.id +">"+ instance.get("name") +"</option>"));
            });
            $("#instance_select").selectmenu();
        },
        
        attach: function() {
            var alert = false,
                device,
                serverId;
            
            if($("#instance_select").val() !== null) {
                serverId = $("#instance_select").find("option:selected").data().id;
            }else {
                alert = true;
            }
            
            if($("#device_input").val() !== "") {
                device = $("#device_input").val();
            }else {
                alert = true;
            }
            
            if(!alert) {
                this.volume.attach(serverId, device, this.credentialId, this.region);
                this.$el.dialog('close'); 
            } 
        }

    });
    
    return VolumeAttachView;
});
