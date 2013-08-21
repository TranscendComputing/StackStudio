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

    var Bucket = ResourceModel.extend({
        idAttribute: "key",
        
        defaults: {
			key: '',
			creation_date: ''
		},

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directories?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"directory": options}, "objectStorageAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directories/" + this.attributes.key + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "objectStorageAppRefresh");
        }
    });

    return Bucket;
});
