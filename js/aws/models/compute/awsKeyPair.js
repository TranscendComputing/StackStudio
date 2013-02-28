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
     * @name KeyPair
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a KeyPair.
     */
    var KeyPair = Backbone.Model.extend({
        idAttribute: "name",

        /** Default attributes for key pair */
        defaults: {
            name: '',
            fingerprint: ''
        },
        
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/key_pairs/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/key_pairs/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var keyPair = {"key_pair": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(keyPair),
                success: function(data) {
                    Common.vent.trigger("keyPairAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return KeyPair;
});
