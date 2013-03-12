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

    // Base Subnet Model
    // ----------

    /**
     *
     * @name Subnet
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Subnet instance.
     */
    var Subnet = Backbone.Model.extend({

        idAttribute: "subnet_id",
        
        /** Default attributes for compute */
        defaults: {
            subnet_id: '',
            vpc_id: '',
            state: '',
            cidr_block: '10.0.0.0/16',
            available_ip_address_count: '',
            tag_set: {},
            availability_zone: ''
		},

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/subnets/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/subnets/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },

        sendPostAction: function(url, options) {
            var subnet = {"subnet": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(subnet),
                success: function(data) {
                    Common.vent.trigger("subnetAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Subnet;
});
