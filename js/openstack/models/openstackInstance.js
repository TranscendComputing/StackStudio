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
     * @name Instance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns an Instance.
     */
    var Instance = Backbone.Model.extend({

        /** Default attributes for instance */
        defaults: {
            id: '',
            image: {},
            flavor: {},
            instance_name: '',
            addresses: {},
            name: '',
            state: '',
            created: '',
            udpated: '',
            tenant_id: '',
            user_id: '',
            key_name: '',
            host: '',
            instance_id: ''
        },
        /**
         * [create description]
         * Launches a new Openstack instance
         * @param  {Hash} options
         * @param  {String} credentialId
         * @return {nil}
         */
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        /**
         * [unpause description]
         * Starts a paused server
         * @param  {String} credentialId
         * @return {nil}
         */
        unpause: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/unpause?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        /**
         * [pause description]
         * Pauses a running server
         * @param  {String} credentialId
         * @return {nil}
         */
        stop: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/pause?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        /**
         * [reboot description]
         * Reboots a server
         * @param  {String} credentialId
         * @return {nil}
         */
        reboot: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/reboot?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        /**
         * [delete description]
         * Deletes an Openstack server
         * @param  {String} credentialId
         * @return {nil}
         */
        terminate: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/terminate?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        /**
         * [disassociateAddress description]
         * Removed elastic IP from server
         * @param  {String} credentialId
         * @return {nil}
         */
        disassociateAddress: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/addresses/disassociate?cred_id=" + credentialId;
            var address = {"address": {"public_ip": this.attributes.public_ip_address}};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(address),
                success: function(data) {
                    Common.vent.trigger("instanceAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        /**
         * [sendPostAction description]
         * Ajax action to send API requests to CloudMux backend service
         * @param  {String} url
         * @param  {Hash} options
         * @return {Hash}
         */
        sendPostAction: function(url, options) {
            var instance = {"instance": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(instance),
                success: function(data) {
                    Common.vent.trigger("instanceAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        }
    });

    return Instance;
});
