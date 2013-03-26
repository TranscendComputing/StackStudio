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
        
        create: function(credentialId) {
            var url = "?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        
        destroy: function(credentialId) {
            var url = "?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        
        associateAddress: function(serverId, credentialId) {
            var url = "/associate/" + serverId+ "?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        
        disassociateAddress: function(credentialId) {
            var url = "/disassociate?cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "elasticIPAppRefresh";
            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }, this); 
        },

        sync: function() {
            return false;
        }
    });

    return ElasticIP;
});
