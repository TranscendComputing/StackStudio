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
        'jquery',
        'backbone',
        'models/resource/resourceModel',
        'common'
], function( $, Backbone, ResourceModel, Common ) {
    'use strict';

    var LoadBalancer = ResourceModel.extend({

        defaults: {
            id: '',
            availability_zones: [],
            created_at: '',
            dns_name: '',
            health_check: {},
            instances: [],
            source_group: '',
            hosted_zone_name: {},
            hosted_zone_name_id: '',
            subnet_ids: [],
            security_groups: [],
            scheme: '',
            vpc_id: ''
        },

        get: function(attr) {
            if(typeof this[attr] === 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },

        instance_count: function() {
            return this.attributes.instances.length;
        },
        
        configureHealthCheck: function(healthCheckOptions, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/configure_health_check?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"health_check": healthCheckOptions}, "loadBalancerAppRefresh");
        },

        createListeners: function(listeners, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/listeners?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"listeners": listeners}, "listenersRefresh");
        },

        destroyListeners: function(ports, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/listeners?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"ports": ports}, "listenersRefresh");
        },

        enableAvailabilityZones: function(availabilityZones, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/availability_zones/enable?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"availability_zones": availabilityZones}, "instancesRefresh");
        },

        disableAvailabilityZones: function(availabilityZones, credentialId, region, disableTrigger) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/availability_zones/disable?cred_id=" + credentialId + "&region=" + region;
            if(disableTrigger) {
                this.sendAjaxAction(url, "POST", {"availability_zones": availabilityZones}, "");
            }else {
                this.sendAjaxAction(url, "POST", {"availability_zones": availabilityZones}, "instancesRefresh");
            }
        },

        registerInstances: function(instanceIds, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/instances/register?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"instance_ids": instanceIds}, "instancesRefresh");
        },

        deregisterInstances: function(instanceIds, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/instances/deregister?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"instance_ids": instanceIds}, "instancesRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "loadBalancerAppRefresh");
        },

        create: function(options, healthCheckOptions, credentialId, region) {
            var lb = this;
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers?cred_id=" + credentialId + "&region=" + region;
            var loadBalancer = {"load_balancer": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(loadBalancer),
                success: function(data) {
                    lb.configureHealthCheck(healthCheckOptions, credentialId, region);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },

        describeHealth: function(credentialId, region) {
            $.ajax({
                url: Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers/"+ this.attributes.id +"/describe_health?cred_id=" + credentialId + "&region=" + region + "&id=" + this.attributes.id + "&availability_zones=" + JSON.stringify(this.attributes.availability_zones),
                type: 'GET',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("resetDescribeHealth", data.AvailabilityZonesHealth, data.InstancesHealth);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }

    });

    return LoadBalancer;
});
