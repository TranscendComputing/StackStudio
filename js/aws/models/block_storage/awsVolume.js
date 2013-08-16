/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var Volume = ResourceModel.extend({

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
		
		create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"volume": options}, "volumeAppRefresh");
        },
        
        attach: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/" + this.attributes.id + "/attach?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"service_id": this.attributes.server_id, "device": this.attributes.device}, "volumeAppRefresh");
        },
        
        detach: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/" + this.attributes.id + "/detach?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "volumeAppRefresh");
        },
        
        forceDetach: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/" + this.attributes.id + "/force_detach?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "volumeAppRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/volumes/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "volumeAppRefresh");
        }
    
    });

    return Volume;
});
