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

    var ElasticIP = ResourceModel.extend({
        idAttribute: "public_ip",

        defaults: {
            public_ip: '',
            allocation_id: '',
            server_id: '',
            network_interface_id: '',
            domain: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses?&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"address": options}, "elasticIPAppRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        },
        
        associateAddress: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "/associate/" + this.attributes.server_id + "?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        },
        
        disassociateAddress: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/addresses/" + this.attributes.public_ip + "/disassociate?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "elasticIPAppRefresh");
        }
    });

    return ElasticIP;
});
