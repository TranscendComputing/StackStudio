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

    var Queue = Backbone.Model.extend({
        idAttribute: "QueueName",

        defaults: {
            QueueName: '',
            QueueUrl: '',
            QueueArn: '',
            ApproximateNumberOfMessages: 0,
            ApproximateNumberOfMessagesNotVisible: 0,
            ApproximateNumberOfMessagesDelayed: 0,
            CreatedTimestamp: '',
            LastModifiedTimestamp: '',
            VisibilityTimeout: 0,
            MaximumMessageSize: 0,
            MessageRetentionPeriod: 0,
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/queue/queues/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            var queue = {queue: options};
            this.sendPostAction(url, queue);
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/queue/queues/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var queue = {queue: this.attributes};
            this.sendPostAction(url, queue);
        },

        sendPostAction: function(url, options) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger("queueAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }

    });

    return Queue;
});
