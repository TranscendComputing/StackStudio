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
        
        create: function(options, credentialId) {
            var url = "";
            if(options["public_key"]){
                url = "/import";
            }
            url += "?cred_id=" + credentialId;
            this.sendPostAction(url, {key_pair: options});
        },
        
        destroy: function(credentialId) {
            var url = "?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url);
        },
        
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "keyPairAppRefresh";
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
            }); 
        }
    });

    return KeyPair;
});
