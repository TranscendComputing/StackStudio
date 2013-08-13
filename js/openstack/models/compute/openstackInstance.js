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

    var Instance = ResourceModel.extend({

        defaults: {
            id: '',
            instance_name: '',
            addresses: {},
            flavor: {},
            host_id: '',
            image: {},
            metadata: [],
            links: [],
            name: '',
            personality: {},
            progress: '',
            accessIPv4: '',
            accessIPv6: '',
            availability_zone: '',
            user_data_encoded: '',
            state: '',
            created: '',
            updated: '',
            tenant_id: '',
            key_name: '',
            fault: '',
            os_dcf_disk_config: '',
            os_ext_srv_attr_host: '',
            os_ext_srv_aatr_hypervisor_hostname: '',
            os_ext_srv_attr_instance_name: '',
            os_ext_sts_power_state: 0,
            os_ext_sts_task_state: '',
            os_ext_sts_vm_state: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances?&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"instance": options}, "instanceAppRefresh");
        },
        
        unpause: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/" + this.attributes.id + "/unpause?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        pause: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/" + this.attributes.id + "/pause?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        reboot: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/" + this.attributes.id + "/reboot?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        },
        
        terminate: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/instances/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "instanceAppRefresh");
        }

    });

    return Instance;
});
