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

    // Base Bucket Model
    // ----------

    /**
     *
     * @name Bucket
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Bucket instance.
     */
    var Bucket = Backbone.Model.extend({

        idAttribute: "key",
        
        defaults: {
			key: '',
			creation_date: ''
		},
		
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/object_storage/directories/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/object_storage/directories/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var directory = {"directory": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(directory),
                success: function(data) {
                    Common.vent.trigger("objectStorageAppRefresh");
                },
                error: function(jqXHR) {
                    var messageObject = JSON.parse(jqXHR.responseText);
                    alert(messageObject["error"]["message"]);
                }
            }); 
        }
    });

    return Bucket;
});
