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

    var LoadBalancer = Backbone.Model.extend({

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
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/configure_health_check?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, health_check: healthCheckOptions};
            var loadBalancer = {"load_balancer": options};
            this.sendPostAction(url, loadBalancer, "loadBalancerAppRefresh");
        },

        createListeners: function(listeners, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/listeners/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, listeners: listeners};
            var loadBalancer = {"load_balancer": options};
            this.sendPostAction(url, loadBalancer, "listenersRefresh");
        },

        destroyListeners: function(ports, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/listeners/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, ports: ports};
            var loadBalancer = {"load_balancer": options};
            this.sendPostAction(url, loadBalancer, "listenersRefresh");
        },

        enableAvailabilityZones: function(availabilityZones, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/availability_zones/enable?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, availability_zones: availabilityZones};
            this.sendPostAction(url, options, "instancesRefresh");
        },

        disableAvailabilityZones: function(availabilityZones, credentialId, region, disableTrigger) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/availability_zones/disable?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, availability_zones: availabilityZones};
            if(disableTrigger) {
                this.sendPostAction(url, options);
            }else {
              this.sendPostAction(url, options, "instancesRefresh");  
            }
        },

        registerInstances: function(instanceIds, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/instances/register?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, instance_ids: instanceIds};
            this.sendPostAction(url, options, "instancesRefresh");
        },

        deregisterInstances: function(instanceIds, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/instances/deregister?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, instance_ids: instanceIds};
            this.sendPostAction(url, options, "instancesRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var loadBalancer = {"load_balancer": this.attributes};
            this.sendPostAction(url, loadBalancer, "loadBalancerAppRefresh");
        },

        create: function(options, healthCheckOptions, credentialId, region) {
            var lb = this;
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
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
                url: Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/describe_health?cred_id=" + credentialId + "&region=" + region + "&id=" + this.attributes.id + "&availability_zones=" + JSON.stringify(this.attributes.availability_zones),
                type: 'GET',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("resetDescribeHealth", data.AvailabilityZonesHealth, data.InstancesHealth);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },
        
        sendPostAction: function(url, options, triggerString) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(triggerString);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }

    });

    return LoadBalancer;
});
