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

    var InternetGateway = Backbone.Model.extend({
        
        defaults: {
            "id": '',
            "attachment_set": {},
            "tag_set": {}
		},

        create: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url);
        },

        attach: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways/attach?cred_id=" + credentialId;
            options.id = this.attributes.id;
            this.sendPostAction(url, options);
        },

        detach: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways/detach?cred_id=" + credentialId;
            var options = {id: this.attributes.id, vpc_id: this.attributes.attachment_set.vpcId};
            this.sendPostAction(url, options);
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/internet_gateways/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },

        sendPostAction: function(url, options) {
            if(options) {
                var internetGateway = {"internet_gateway": options};
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify(internetGateway),
                    success: function(data) {
                        Common.vent.trigger("internetGatewayAppRefresh");
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                }); 
            }else {
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(data) {
                        Common.vent.trigger("internetGatewayAppRefresh");
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }
            
        }
    });

    return InternetGateway;
});
