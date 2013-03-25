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
        /**
         * [create description]
         * Launches a new Openstack instance
         * @param  {Hash} options
         * @param  {String} credentialId
         * @return {nil}
         */
        create: function(options, credentialId) {
            var url = "?cred_id=" + credentialId;
            this.sendPostAction(url, {instance: options});
        },
        /**
         * [unpause description]
         * Starts a paused server
         * @param  {String} credentialId
         * @return {nil}
         */
        unpause: function(credentialId) {
            var url = "/unpause?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        /**
         * [pause description]
         * Pauses a running server
         * @param  {String} credentialId
         * @return {nil}
         */
        pause: function(credentialId) {
            var url = "/pause?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        /**
         * [reboot description]
         * Reboots a server
         * @param  {String} credentialId
         * @return {nil}
         */
        reboot: function(credentialId) {
            var url = "/reboot?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        /**
         * [delete description]
         * Deletes an Openstack server
         * @param  {String} credentialId
         * @return {nil}
         */
        terminate: function(credentialId) {
            var url = "?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        /**
         * [disassociateAddress description]
         * Removed elastic IP from server
         * @param  {String} credentialId
         * @return {nil}
         */
        disassociateAddress: function(address, credentialId) {
            var url = "/disassociate_address?cred_id=" + credentialId;
            this.sendPostAction(url, {ip_address: address});
        },
        /**
         * [sendPostAction description]
         * Ajax action to send API requests to CloudMux backend service
         * @param  {String} url
         * @param  {Hash} options
         * @return {Hash}
         */
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "instanceAppRefresh";
            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
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
