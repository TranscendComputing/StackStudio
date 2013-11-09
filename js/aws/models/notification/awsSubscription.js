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

    var Subscription = ResourceModel.extend({
        idAttribute: "SubscriptionArn",

        defaults: {
            Protocol: '',
            Owner: '',
            TopicArn: '',
            SubscriptionArn: '',
            Endpoint: ''
        },

        create: function(topic, options, credentialId, region, eventString) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/"+ topic +"/subscriptions?cred_id=" + credentialId + "&region=" + region;
            var eventName = eventString ? eventString : "subscriptionRefresh";
            this.sendAjaxAction(url, "POST", {"subscription": options}, eventName);
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/subscriptions/"+ this.attributes.SubscriptionArn +"?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "subscriptionRefresh");
        }
    });

    return Subscription;
});
