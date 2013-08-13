/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    var Topic = ResourceModel.extend({

        defaults: {
            id: '',
            Name: '',
            DisplayName: '',
            Owner: '',
            SubscriptionsPending: 0,
            SubscriptionsConfirmed: 0,
            SubscriptionsDeleted: 0,
            EffectiveDeliveryPolicy: '',
            Policy: '',
            TopicArn: ''
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"topic": options}, "topicAppRefresh");
        },

        publish: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/"+ this.attributes.id +"/publish?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"publish": options}, "");
        },

        editDisplayName: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/"+ this.attributes.id +"/set_attribute?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"attribute": options}, "topicAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/notification/topics/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "topicAppRefresh");
        }
    });

    return Topic;
});
