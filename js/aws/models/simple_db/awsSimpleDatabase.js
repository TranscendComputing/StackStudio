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

    var SimpleDB = ResourceModel.extend({
        idAttribute: 'DomainName',

        defaults: {
            DomainName: '',
            ItemCount: 0,
            ItemNamesSizeBytes: 0,
            AttributeNameCount: 0,
            AttributeNamesSizeBytes: 0,
            AttributeValueCount: 0,
            AttributeValuesSizeBytes: 0,
            Timestamp: '',
            RequestId: '',
            BoxUsage: 0.0
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/simple_db/databases?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"simple_db": options}, "simpleDBAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/simple_db/databases/" + this.attributes.DomainName + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "simpleDBAppRefresh");
        }
    });

    return SimpleDB;
});
