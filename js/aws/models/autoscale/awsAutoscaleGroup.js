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

    var AutoscaleGroup = ResourceModel.extend({

        defaults: {
            id: '',
            arn: '',
            availability_zones: '',
            created_at: '',
            default_cooldown: 0,
            desired_capacity: 0,
            enabled_metrics: [],
            health_check_grace_period: 0,
            health_check_type: '',
            instances: '',
            launch_configuration_name: '',
            load_balancer_names: [],
            max_size: 0,
            min_size: 0,
            placement_group: '',
            suspended_processes: [],
            tags: [],
            termination_policies: [],
            vpc_zone_identifier: ''
        },

        create: function(launch_config_options, autoscale_group_options, trigger_options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/autoscale/autoscale_groups?cred_id=" + credentialId + "&region=" + region;
            var options = {"launch_configuration": launch_config_options, "autoscale_group": autoscale_group_options};
            if(trigger_options) {
                options["trigger"] = trigger_options;
            }
            this.sendAjaxAction(url, "POST", options, "autoscaleAppRefresh");
        },

        spinDown: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/autoscale/autoscale_groups/"+ this.attributes.id +"/spin_down?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "autoscaleAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/autoscale/autoscale_groups/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "autoscaleAppRefresh");
        }
    });

    return AutoscaleGroup;
});
