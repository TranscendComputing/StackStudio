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

    var SpotInstance = ResourceModel.extend({

        defaults: {
            id: '',
            price: 0.0,
            request_type: '',
            created_at: '',
            instance_count: 0,
            instance_id: '',
            state: '',
            valid_from: '',
            valid_until: '',
            launch_group: '',
            availability_zone_group: '',
            product_description: '',
            groups: [],
            key_name: '',
            availability_zone: '',
            flavor_id: '',
            image_id: '',
            monitoring: false,
            block_device_mapping: [],
            subnet_id: '',
            tags: {},
            fault: '',
            user_data: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/spot_requests?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"spot_request": options}, "spotInstanceAppRefresh");
        },
        
        cancel: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/spot_requests/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "spotInstanceAppRefresh");
        }
    });
    
    
    return SpotInstance;
});
