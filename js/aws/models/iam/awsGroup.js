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

    var Group = Backbone.Model.extend({

        idAttribute: 'GroupName',

        defaults: {
            GroupId: '',
            GroupName: '',
            Path: '',
            Arn: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/create?_method=PUT&cred_id=" + credentialId;
            var options = {group: options};
            this.sendPostAction(url, options, "groupAppRefresh");
        },

        addUser: function(user, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/users/add?cred_id=" + credentialId;
            var options = {group: this.attributes, user: user};
            this.sendPostAction(url, options, "groupUsersRefresh");
        },

        removeUser: function(user, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/users/remove?cred_id=" + credentialId;
            var options = {group: this.attributes, user: user};
            this.sendPostAction(url, options, "groupUsersRefresh");
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/iam/groups/delete?_method=DELETE&cred_id=" + credentialId;
            var options = {group: this.attributes};
            this.sendPostAction(url, options, "groupAppRefresh");
        },

        sendPostAction: function(url, options, triggerString) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(triggerString);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Group;
});
