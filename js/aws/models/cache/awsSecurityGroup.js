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

    var SecurityGroup = ResourceModel.extend({
        idAttribute: "group_id",
        
        defaults: {
            name: '',
            description: '',
            group_id: '',
            ip_permissions: [],
            ip_permissions_egress: [],
            owner_id: '',
            vpc_id: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"security_group": options}, "securityGroupAppRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/" + this.attributes.group_id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "topicAppRefresh");
        }
        
    });

    return SecurityGroup;
});
