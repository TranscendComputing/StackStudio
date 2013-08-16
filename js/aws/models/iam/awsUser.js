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

    var User = ResourceModel.extend({

        defaults: {
            id: '',
            path: '',
            arn: '',
            user_id: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"user": options}, "userCreated");
        },

        createLoginProfile: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/login_profile?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"user": options}, "");
        },

        createAccessKey: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/access_key?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", options, "userKeysGenerated");
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/"+ this.attributes.id +"?_method=DELETE&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "userAppRefresh");
        }
    });

    return User;
});
