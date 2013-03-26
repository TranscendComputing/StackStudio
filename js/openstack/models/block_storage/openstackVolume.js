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

    // Base Volume Model
    // ----------

    /**
     *
     * @name Volume
     * @constructor
     * @category BlockStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Volume instance.
     */
    var Volume = Backbone.Model.extend({

        defaults: {
            size: 5,
            name: 'NewVolume',
            description: "My new volume"
		},

        parse: function(data) {
            // Some volumes are returned with empty objects as attachments,
            // remove those here in order to display correctly
            if(data.attachments.length == 1)
            {
                if($.isEmptyObject( data.attachments[0] ))
                {
                    data.attachments = [];
                }
            }
            return data;
        },
		
		create: function(credentialId, region) {
            var url = "?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {volume: this.attributes});
        },
        
        attach: function(serverId, device, credentialId, region) {
            var url = "/attach?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {server_id: serverId, device: device});
        },
        
        detach: function(credentialId, region) {
            var serverId = this.get("attachments")[0]["serverId"];
            var url = "/detach/" + serverId + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },
        
        destroy: function(credentialId, region) {
            var url = "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },
		
		sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "volumeAppRefresh";
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
        },

        sync: function() {
            return false;
        }
    
    });

    return Volume;
});
