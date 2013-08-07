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

    var Vpc = ResourceModel.extend({

        idAttribute: "id",

        defaults: {
            id: '',
            state: '',
            cidr_block: '10.0.0.0/16',
            dhcp_options_id: '',
            tags: {},
            tenancy: 'default'
		},

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"vpc": options}, "vpcAppRefresh");
        },

        associateDhcpOptions: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/" + options.id + "/dhcp_options/" + options.dhcp_options_id + "?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "vpcAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "vpcAppRefresh");
        }
    });

    return Vpc;
});
