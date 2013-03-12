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
        'text!templates/aws/block_storage/awsVolumeAttachTemplate.html',
        '/js/aws/collections/compute/awsInstances.js',
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
        
        volume: undefined,
        
        instances: new Instances(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
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
            if(this.volume.attributes.tags && this.volume.attributes.tags.hasOwnProperty("Name")) {
                volumeName = " (" + this.volume.attributes.tags.Name + ")";
            }
            $("#volume_display").text(this.volume.attributes.id + volumeName + " in " + this.volume.attributes.availability_zone);
            $("#instance_zone_message").text("in " + this.volume.attributes.availability_zone);
            $("#instance_select").selectmenu();
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ data: $.param({ cred_id: this.credentialId, filters: {"availability-zone": this.volume.attributes.availability_zone}}) });
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
                var instanceName = "";
                if(instance.attributes.tags && instance.attributes.tags.hasOwnProperty("Name")) {
                    instanceName = " (" + instance.attributes.tags.Name + ")";
                }
                $("#instance_select").append($("<option value="+ instance.attributes.id +">"+ instance.attributes.id + instanceName +"</option>"));
            });
            $("#instance_select").selectmenu();
        },
        
        attach: function() {
            var alert = false;
            
            if($("#instance_select").val() !== null) {
                this.volume.attributes.server_id = $("#instance_select").val();
            }else {
                alert = true;
            }
            
            if($("#device_input").val() !== "") {
                this.volume.attributes.device = $("#device_input").val();
            }else {
                alert = true;
            }
            
            if(!alert) {
                this.volume.attach(this.credentialId);
                this.$el.dialog('close'); 
            } 
        }

    });
    
    return VolumeAttachView;
});
