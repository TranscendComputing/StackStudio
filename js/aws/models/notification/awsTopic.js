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

    // Aws Topic Model
    // ----------

    /**
     *
     * @name Topic
     * @constructor
     * @category Notification
     * @param {Object} initialization object.
     * @returns {Object} Returns an Topic.
     */
    var Topic = Backbone.Model.extend({

        /** Default attributes for topic */
        defaults: {
            id: '',
            Name: '',
            Owner: '',
            SubscriptionsPending: 0,
            SubscriptionsConfirmed: 0,
            SubscriptionsDeleted: 0,
            EffectiveDeliveryPolicy: '',
            Policy: '',
            TopicArn: ''
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {"topic": options});
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var topic = {"topic": this.attributes};
            this.sendPostAction(url, topic);
        },

        sendPostAction: function(url, options) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger("topicAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Topic;
});
