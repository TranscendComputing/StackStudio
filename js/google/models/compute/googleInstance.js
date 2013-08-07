/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var Instance = ResourceModel.extend({

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
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/instances?&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"instance": options}, "instanceAppRefresh");
        },
        
        start: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/instances/" + this.attributes.id + "/start?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        stop: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/instances/" + this.attributes.id + "/stop?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        reboot: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/instances/" + this.attributes.id + "/reboot?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        terminate: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/instances/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        disassociateAddress: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/addresses/" + this.attributes.public_ip_address + "/disassociate?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        }

    });

    return Instance;
});
