/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/openstack/load_balancer/openstackManageAvailabilityZonesTemplate.html',
        '/js/openstack/collections/compute/openstackAvailabilityZones.js',
        'common'
        
], function( $, _, Backbone, DialogView, manageAvailabilityZones, AvailabilityZones, Common ) {
    
    var ManageAvailabilityZonesView = DialogView.extend({

        template: _.template(manageAvailabilityZones),

        credentialId: undefined,

        region: undefined,

        loadBalancer: undefined,

        availabilityZones: undefined,
        
        events: {
            "dialogclose": "close",
            "click input.zone": "render"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.loadBalancer = options.load_balancer;
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Manage Availability Zones",
                resizable: false,
                width: 425,
                modal: true,
                buttons: {
                    Save: function () {
                        createView.save();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            this.availabilityZones = new AvailabilityZones();
            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true});
        },

        render: function() {
            var assignedAzCount = $("input.zone:checked").length;
            if(assignedAzCount > 1) {
                $("input.zone:checked").removeAttr("disabled");
            }else {
                $("input.zone:checked").attr("disabled", true);
            }
        },
        
        addAllAvailabilityZones: function() {
            var manageView = this;
            this.availabilityZones.each(function(az) {
                var azFound = false;
                $.each(manageView.loadBalancer.attributes.availability_zones, function(index, value) {
                    if(value === az.attributes.name) {
                        azFound = true;
                    }
                });
                if(azFound) {
                    $("#zone_management").append("<input id=" + az.attributes.name + " type='checkbox' class='zone' checked />" + az.attributes.name + "<br />");
                }else {
                    $("#zone_management").append("<input id=" + az.attributes.name + " type='checkbox' class='zone' />" + az.attributes.name + "<br />");
                }
            });
            this.render();
        },

        save: function() {
            var options = {},
                enabledAvailabilityZones = [],
                disableAvailabilityZones = [],
                checkedZones = $("input.zone:checked"),
                uncheckedZones = $("input.zone:not(:checked)");
                
            $.each(checkedZones, function(index, value) {
                enabledAvailabilityZones.push(value.id);
            });

            $.each(uncheckedZones, function(index, value) {
                disableAvailabilityZones.push(value.id);
            });
            if(disableAvailabilityZones.length > 0) {
                this.loadBalancer.disableAvailabilityZones(disableAvailabilityZones, this.credentialId, this.region, true);
            }
            if(enabledAvailabilityZones.length > 0) {
                this.loadBalancer.enableAvailabilityZones(enabledAvailabilityZones, this.credentialId, this.region);
            }
            this.$el.dialog('close');
        }
    });
    
    return ManageAvailabilityZonesView;
});
