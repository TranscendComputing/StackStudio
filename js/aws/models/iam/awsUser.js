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

    var User = Backbone.Model.extend({

        defaults: {
            id: '',
            path: '',
            arn: '',
            user_id: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options, "userCreated");
        },

        createLoginProfile: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/create_login_profile?cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        createAccessKey: function(options, credentialId) {
            $.ajax({
                url: Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/create_access_key?cred_id=" + credentialId,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger("userKeysGenerated", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/users/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes, "userAppRefresh");
        },

        sendPostAction: function(url, options, triggerString) {
            var user = {"user": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(user),
                success: function(data) {
                    Common.vent.trigger(triggerString);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return User;
});
