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

    var Subnet = ResourceModel.extend({

        idAttribute: "subnet_id",
        
        defaults: {
            subnet_id: '',
            vpc_id: '',
            state: '',
            cidr_block: '10.0.0.0/16',
            available_ip_address_count: '',
            tag_set: {},
            availability_zone: ''
		},

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/subnets?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"subnet": options}, "subnetAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/subnets/" + this.attributes.subnet_id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "subnetAppRefresh");
        }
    });

    return Subnet;
});
