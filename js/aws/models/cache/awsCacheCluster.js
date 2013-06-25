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

    var CacheCluster = ResourceModel.extend({

        defaults: {
            id: '',
            status: '',
            node_type: '',
            engine: '',
            pending_values: {},
            zone: '',
            create_time: '',
            engine_version: '',
            auto_upgrade: false,
            maintenance_window: '',
            num_nodes: 0,
            nodes: []
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/cache/clusters?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"cluster": options}, "cacheAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/cache/clusters/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "cacheAppRefresh");
        }
    });

    return CacheCluster;
});
