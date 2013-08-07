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

    var Snapshot = ResourceModel.extend({

        defaults: {
            id: '',
            description: '',
            progress: '',
            created_at: '',
            owner_id: '',
            state: '',
            tags: {},
            volume_id: '',
            volume_size: 0
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/block_storage/snapshots?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"snapshot": options}, "snapshotAppRefresh");
        }
    
    });

    return Snapshot;
});
