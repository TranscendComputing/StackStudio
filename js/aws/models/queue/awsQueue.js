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

    var Queue = ResourceModel.extend({
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
            MessageRetentionPeriod: 0
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/queue/queues?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"queue": options}, "queueAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/queue/queues?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"queue": this.attributes}, "queueAppRefresh");
        }
    });

    return Queue;
});
