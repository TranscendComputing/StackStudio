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
            if(typeof this[attr] == 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },

        instance_count: function() {
            return this.attributes.instances.length;
        },
        
        create: function(options, healthCheckOptions, credentialId, region) {
            var lb = this;
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            var loadBalancer = {"load_balancer": options};
            //Use its own ajax call to call configure health check upon success
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

        configureHealthCheck: function(healthCheckOptions, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/configure_health_check?cred_id=" + credentialId + "&region=" + region;
            var options = {id: this.attributes.id, health_check: healthCheckOptions};
            this.sendPostAction(url, options);
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var loadBalancer = {"load_balancer": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(loadBalancer),
                success: function(data) {
                    Common.vent.trigger("loadBalancerAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }

    });

    return LoadBalancer;
});
