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
        'models/resource/resourceModel',
        'common'
], function( $, Backbone, ResourceModel, Common ) {
    'use strict';

    var Group = ResourceModel.extend({

        idAttribute: 'GroupName',

        defaults: {
            GroupId: '',
            GroupName: '',
            Path: '',
            Arn: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups?&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"group": options}, "groupAppRefresh");
        },

        addUser: function(user, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/"+ this.attributes.GroupName +"/users/"+ user["id"] +"?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "groupUsersRefresh");
        },

        removeUser: function(user, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/"+ this.attributes.GroupName +"/users/"+ user["id"] +"?_method=DELETE&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "groupUsersRefresh");
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/"+ this.attributes.GroupName +"?_method=DELETE&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "groupAppRefresh");
        }
    });

    return Group;
});
