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

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    // File Model
    // ----------

    var File = Backbone.Model.extend({
        idAttribute: "key",

        parse: function(data) {
            var size = (data.content_length / 1000).toFixed(2);
            data.size = data.size > 1000 ? (size / 1000).toFixed(2).toString() + " MB" : size.toString() + " KB";
            return data;
        },

        download: function(credentialId, region) {
            $.ajax({
                url: this.url() + "?cred_id=" + credentialId,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                success: function(data) {
                    //Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return File;
});
