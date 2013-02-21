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
            id: '',
			attached_at: '',
			availability_zone: '',
			created_at: '',
			delete_on_termination: '',
			device: '',
			iops: '',
			server_id: '',
			size: 0,
			snapshot_id: '',
			state: '',
			tags: {},
			type: ''
		},
		
		create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },
        
        attach: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/attach?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        detach: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/detach?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        forceDetach: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/force_detach?cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },
		
		sendPostAction: function(url, options) {
            var volume = {"volume": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(volume),
                success: function(data) {
                    Common.vent.trigger("volumeAppRefresh");
                },
                error: function(jqXHR) {
                    var messageObject = JSON.parse(jqXHR.responseText);
                    alert(messageObject["error"]["message"]);
                }
            }); 
        }
    
    });

    return Volume;
});
