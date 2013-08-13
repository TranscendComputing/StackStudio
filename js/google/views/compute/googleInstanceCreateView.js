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
            //$("#machine_select").selectmenu();
            $("#image_select").selectmenu();
            
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
            $("#zone_select").selectmenu();
        },
        
        zoneSelect: function(event){
            //this.addAllDisks(event.target.value);
        },
        
        addAllMachineTypes: function() {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/machine_types?_method=GET&cred_id=" + this.credentialId;
            
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(payload) {
                    var disks = payload;
                    if(disks){
                        $.each(disks, function(i, disk) {
                           $("#machine_select").append("<option value='"+disk.name+"'>" + disk.name + "</option>");
                        });
                    }
                    $("#machine_select").selectmenu();
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
                //inst.machine_type = $("#machine_select").val();
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
