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

    // Base Vpc Model
    // ----------

    /**
     *
     * @name Vpc
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Vpc instance.
     */
    var Vpc = Backbone.Model.extend({

        idAttribute: "id",

        defaults: {
            id: '',
            state: '',
            cidr_block: '10.0.0.0/16',
            dhcp_options_id: '',
            tags: {},
            tenancy: 'default'
		},

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        associateDhcpOptions: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/associate_dhcp_options?cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/vpcs/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },

        sendPostAction: function(url, options) {
            var vpc = {"vpc": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(vpc),
                success: function(data) {
                    Common.vent.trigger("vpcAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Vpc;
});
