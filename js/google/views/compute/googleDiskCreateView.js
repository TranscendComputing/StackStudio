/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/google/compute/googleDiskCreateTemplate.html',
        '/js/google/models/compute/googleDisk.js',
        '/js/google/collections/compute/googleAvailabilityZones.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, diskCreateTemplate, Disk, Zones, ich, Common ) {
    
    /**
     * googleDiskCreateView is UI form to create compute.
     *
     * @name DiskCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleDiskCreateView disk.
     */
    
    var GoogleDiskCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        disk: new Disk(),
        
        zones: new Zones(),
        
        // Delegated events for creating new disks, etc.
        events: {
            "dialogclose": "close",
            "change #zone_select":"zoneSelect"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(diskCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Disk",
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
            $("#image_select").selectmenu();
            
            this.zones.on( 'reset', this.addAllZones, this );
            this.zones.fetch({ data: $.param({ cred_id: this.credentialId }), reset: true });
        },

        render: function() {
            
        },
        
        addAllZones: function() {
            this.zones.each(function(zone) {
               $("#zone_select").append("<option value='"+zone.attributes.name+"'>" + zone.attributes.name + "</option>");
            });
            $("#zone_select").selectmenu();
        },
        
        zoneSelect: function(event){
            //this.addAllDisks(event.target.value);
        },
        
        create: function() {
            var newDisk = this.disk;
            var dsk = {};
            
            dsk.zone_name = $("#zone_select").val();
            dsk.image_name = $("#image_select").val();
            
            var issue = false;
            
            if($("#sg_name").val() !== "" ) {
                dsk.name = $("#sg_name").val();
            }else {
                issue = true;
            }
            
            var sizeInt = parseInt($("#size_input").val(), 10);
            if(sizeInt >= 10 && sizeInt <= 20) {
                dsk.size_gb = sizeInt;
            }else {
                issue = true;
            }
            
            if(!issue) {
                newDisk.create(dsk, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GoogleDiskCreateView;
});
