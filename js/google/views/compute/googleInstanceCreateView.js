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
        'text!templates/google/compute/googleInstanceCreateTemplate.html',
        '/js/google/models/compute/googleInstance.js',
        '/js/google/collections/compute/googleAvailabilityZones.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, instanceCreateTemplate, Instance, Zones, ich, Common ) {
    
    /**
     * googleInstanceCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleInstanceCreateView instance.
     */
    
    var AwsSecurityGroupCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        instance: new Instance(),
        
        zones: new Zones(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "change #zone_select":"zoneSelect"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(instanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Instance",
                resizable: false,
                width: 425,
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
            $("#zone_select").selectmenu();
            
            this.zones.on( 'reset', this.addAllZones, this );
            this.zones.fetch({ data: $.param({ cred_id: this.credentialId }), reset: true });
        },

        render: function() {
            
        },
        
        addAllZones: function() {
            this.zones.each(function(zone) {
               $("#zone_select").append("<option>" + zone.attributes.name + "</option>");
            });
            $("#zone_select").selectmenu();
            
            
        },
        
        zoneSelect: function(event){
            alert("made it");
        },

        create: function() {
            var newSecurityGroup = this.securityGroup;
            var options = {};
            var issue = false;
            
            if($("#sg_name").val() !== "" ) {
                options.server_name = $("#sg_name").val();
                options.zone_name = $("#zone_select").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newSecurityGroup.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return AwsSecurityGroupCreateView;
});
