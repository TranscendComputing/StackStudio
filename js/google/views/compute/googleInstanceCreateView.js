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
        'google/models/compute/googleInstance',
        'google/collections/compute/googleAvailabilityZones',
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
        
        zones: undefined,
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "change #zone_select":"zoneSelect",
            "change #disk_select":"diskSelect"
        },

        initialize: function(options) {
            this.zones = new Zones();
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
            
            this.zones.on( 'reset', this.addAllZones, this );
            this.zones.fetch({ data: $.param({ cred_id: this.credentialId }), reset: true });
            //this.addAllMachineTypes();
        },

        render: function() {
            
        },
        
        addAllZones: function() {
            this.zones.each(function(zone) {
               $("#zone_select").append("<option value='"+zone.attributes.name+"'>" + zone.attributes.name + "</option>");
            });
            $("#zone_select").val(this.region);
            $('#zone_select').trigger('change');
        },
        
        zoneSelect: function(event){
            this.addAllDisks(event.target.value);
        },
        
        diskSelect: function(){
            this.addAllMachineTypes();
        },
        
        addAllMachineTypes: function() {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/machine_types?_method=GET&cred_id=" + this.credentialId + "&region=" + $("#zone_select").val();
            
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(payload) {
                    var disks = payload;
                    $("#machine_select").empty();
                    if(disks){
                        $.each(disks, function(i, disk) {
                            if($("#disk_select").val() !== "default_disk"){
                                $("#machine_select").append("<option value='"+disk.name+"'>" + disk.name + "</option>");
                            }else if((disk.name !== "f1-micro") && (disk.name !== "g1-small")){
                                $("#machine_select").append("<option value='"+disk.name+"'>" + disk.name + "</option>");
                            }
                        });
                    }
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        addAllDisks: function(region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/disks?_method=GET&cred_id=" + this.credentialId + "&region=" + region;
            var instCreateView = this;
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(payload) {
                    var disks = payload;
                    if(disks){
                        $("#disk_select").empty();
                        $("#disk_select").append("<option value='default_disk'>Default Disk</option>");
                        $.each(disks, function(i, disk) {
                           $("#disk_select").append("<option value='"+disk.name+"'>" + disk.name + "</option>");
                        });
                    }
                    instCreateView.addAllMachineTypes();
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        create: function() {
            var newInstance = this.instance;
            var inst = {};
            
            var issue = false;
            
            if($("#sg_name").val() !== "" ) {
                inst.name = $("#sg_name").val();
                inst.zone_name = $("#zone_select").val();
                if($("#disk_select").val() !== "default_disk"){
                    inst.disk = $("#disk_select").val();
                }
                inst.machine_type = $("#machine_select").val();
                inst.image_name = $("#image_select").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newInstance.create(inst, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return AwsSecurityGroupCreateView;
});
