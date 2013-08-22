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

    var File = ResourceModel.extend({
        idAttribute: "key",
        
        defaults: {
            key: '',
            cache_control: '',
            content_disposition: '',
            content_encoding: '',
            content_length: 0,
            content_md5: '',
            content_type: '',
            etag: '',
            expires: '',
            last_modified: '',
            metadata: {},
            owner: {},
            storage_class: '',
            encryption: '',
            version: ''
        },

        destroy: function(directoryName, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/object_storage/directories/" + directoryName + "/files/"+ this.attributes.key +"?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "objectStorageObjectRefresh");
        }
    });

    return File;
});
