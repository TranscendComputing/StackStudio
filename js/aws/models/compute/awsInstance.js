/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    // Aws Instance Model
    // ----------

    /**
     *
     * @name Instance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns an Instance.
     */
    var Instance = Backbone.Model.extend({

        /** Default attributes for instance */
        defaults: {
            id: '',
            image_id: '',
            flavor_id: '',
            block_device_mapping: {},
            network_interfaces: [],
            iam_instance_profile: {},
            state: '',
            monitoring: false,
            availability_zone: '',
            placement_group: {},
            tenancy: '',
            product_codes: [],
            state_reason: {},
            tags: {},
            ownerId: '',
            private_dns_name: '',
            dns_name: '',
            reason: {},
            key_name: '',
            ami_launch_index: 0,
            created_at: '',
            kernel_id: '',
            private_ip_address: '',
            public_ip_address: '',
            root_device_type: '',
            client_token: '',
            ebs_optimized: false,
            groups: [],
            security_group_ids: []
        },
        
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/instances/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        
        start: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/instances/start?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        stop: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/instances/stop?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        reboot: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/instances/reboot?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        terminate: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/instances/terminate?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        disassociateAddress: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/disassociate?cred_id=" + credentialId;
            var address = {"address": {"public_ip": this.attributes.public_ip_address}};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(address),
                success: function(data) {
                    Common.vent.trigger("instanceAppRefresh");
                },
                error: function(jqXHR) {
                    var messageObject = JSON.parse(jqXHR.responseText);
                    alert(messageObject["error"]["message"]);
                }
            }); 
        },
        
        sendPostAction: function(url, options) {
            var instance = {"instance": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(instance),
                success: function(data) {
                    Common.vent.trigger("instanceAppRefresh");
                },
                error: function(jqXHR) {
                    var messageObject = JSON.parse(jqXHR.responseText);
                    alert(messageObject["error"]["message"]);
                }
            }); 
        }

    });

    return Instance;
});
