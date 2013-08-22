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
        'text!templates/google/compute/googleSnapshotCreateTemplate.html',
        '/js/google/models/compute/googleSnapshot.js',
        '/js/google/collections/compute/googleAvailabilityZones.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, snapshotCreateTemplate, Snapshot, Zones, ich, Common ) {
    
    /**
     * googleSnapshotCreateView is UI form to create compute.
     *
     * @name SnapshotCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleSnapshotCreateView snapshot.
     */
    
    var GoogleSnapshotCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        snapshot: new Snapshot(),
        
        zones: undefined,
        
        // Delegated events for creating new snapshots, etc.
        events: {
            "dialogclose": "close",
            "change #zone_select":"zoneSelect"
        },

        initialize: function(options) {
            this.zones = new Zones();
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(snapshotCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Snapshot",
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
            $("#disk_select").selectmenu();
            
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
            $("#zone_select").selectmenu();
        },
        
        zoneSelect: function(event){
            this.addAllDisks(event.target.value);
        },

        addAllDisks: function(region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/disks?_method=GET&cred_id=" + this.credentialId + "&region=" + region;
            var snpshtCreateView = this;
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(payload) {
                    var disks = payload;
                    if(disks){
                        $("#disk_select").empty();
                        $.each(disks, function(i, disk) {
                           $("#disk_select").append("<option value='"+disk.name+"'>" + disk.name + "</option>");
                        });
                    }
                    $("#disk_select").selectmenu();
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        create: function() {
            var newSnapshot = this.snapshot;
            var snpsht = {};
            
            var issue = false;
            
            if($("#sg_name").val() !== "" ) {
                snpsht.name = $("#sg_name").val();
                snpsht.zone_name = $("#zone_select").val();
                snpsht.disk = $("#disk_select").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newSnapshot.create(snpsht, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GoogleSnapshotCreateView;
});
