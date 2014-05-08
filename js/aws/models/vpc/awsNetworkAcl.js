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

    // Network ACL Model
    // ----------

    /**
     *
     * @name NetworkAcl
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a NetworkAcl instance.
     */
    var NetworkAcl = ResourceModel.extend({

        idAttribute: "network_acl_id",
        
        /** Default attributes for compute */
        defaults: {
            network_acl_id: '',
            vpc_id: '',
            defaults: false,
            entries: [],
            associations: [],
            tags: []
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/network_acls?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"vpc_id": options}, "networkAclAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/network_acls/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "networkAclAppRefresh");
        }
        
    });

    return NetworkAcl;
});
