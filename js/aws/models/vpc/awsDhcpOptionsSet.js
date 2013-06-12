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
        'models/resource/resourceModel',
        'common'
], function( $, Backbone, ResourceModel, Common ) {
    'use strict';

    var DhcpOptionsSet = ResourceModel.extend({
        
        defaults: {
            "id": '',
            "dhcp_configuration_set": {},
            "tag_set": {}
		},

        get: function(attr) {
            if(typeof this[attr] === 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },
        
        dhcp_configuration_set: function() {
            var configurationSet = "";
            $.each(this.attributes.dhcp_configuration_set, function(k, v) {
                configurationSet = configurationSet + k + " = " + v + "; ";
            });
            return configurationSet;
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/dhcp_options?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"dhcp_option": options}, "dhcpOptionAppRefresh");
        },

        destroy: function(credentialId,region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/dhcp_options/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "dhcpOptionAppRefresh");
        }
    });

    return DhcpOptionsSet;
});
