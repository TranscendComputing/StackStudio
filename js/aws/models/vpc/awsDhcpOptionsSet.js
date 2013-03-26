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

    // Base DhcpOptionsSet Model
    // ----------

    /**
     *
     * @name DhcpOptionsSet
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a DhcpOptionsSet instance.
     */
    var DhcpOptionsSet = Backbone.Model.extend({
        
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
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/dhcp_options/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, options);
        },

        destroy: function(credentialId,region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/dhcp_options/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, this.attributes);
        },

        sendPostAction: function(url, options) {
            var dhcpOption = {"dhcp_option": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(dhcpOption),
                success: function(data) {
                    Common.vent.trigger("dhcpOptionAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return DhcpOptionsSet;
});
