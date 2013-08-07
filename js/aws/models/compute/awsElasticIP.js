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

    var ElasticIP = ResourceModel.extend({
        idAttribute: "public_ip",

        defaults: {
            public_ip: '',
            allocation_id: '',
            server_id: '',
            network_interface_id: '',
            domain: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses?&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"address": options}, "elasticIPAppRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        },
        
        associateAddress: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "/associate/" + this.attributes.server_id + "?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        },
        
        disassociateAddress: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "/disassociate?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        }
    });

    return ElasticIP;
});
