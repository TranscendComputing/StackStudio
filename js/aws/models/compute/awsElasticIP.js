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

    /**
     *
     * @name ElasticIP
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ElasticIP.
     */
    var ElasticIP = Backbone.Model.extend({
        idAttribute: "public_ip",

        /** Default attributes for key pair */
        defaults: {
            public_ip: '',
            allocation_id: '',
            server_id: '',
            network_interface_id: '',
            domain: ''
        },
        
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        associateAddress: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/associate?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        disassociateAddress: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/disassociate?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var address = {"address": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(address),
                success: function(data) {
                    Common.vent.trigger("elasticIPAppRefresh");
                },
                error: function(jqXHR) {
                    var messageObject = JSON.parse(jqXHR.responseText);
                    alert(messageObject["error"]["message"]);
                }
            }); 
        }
    });

    return ElasticIP;
});
