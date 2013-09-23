/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'models/resource/resourceModel',
        'common'
], function( $, ResourceModel, Common ) {
    'use strict';

    var InternetGateway = ResourceModel.extend({
        
        defaults: {
            "id": '',
            "attachment_set": {},
            "tag_set": {}
		},

        create: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "internetGatewayAppRefresh");
        },

        attach: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/" + options["vpc_id"] + "/internet_gateways/" + options["id"] + "/attach?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "internetGatewayAppRefresh");
        },

        detach: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/" + this.attributes.attachment_set.vpcId + "/internet_gateways/" + this.attributes.id + "/attach?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "internetGatewayAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "internetGatewayAppRefresh");
        }
    });

    return InternetGateway;
});
