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

        get: function(attr) {
            if(typeof this[attr] === 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },

        create: function(credentialId, region) {
            var url = "?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {load_balancer: this.attributes});
        },

        destroy: function(credentialId, region) {
            var url = "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },
        
        instance_count: function() {
            return this.attributes.instances.length;
        },
        
        configureHealthCheck: function(healthCheckOptions, credentialId, region) {
            var url = "/configure_health_check?cred_id=" + credentialId + "&region=" + region;
            var options = {health_check: healthCheckOptions};
            this.sendPostAction(url, options);
        },

        createListeners: function(listeners, credentialId, region) {
            var url = "/listeners?cred_id=" + credentialId + "&region=" + region;
            var options = {listeners: listeners};
            this.sendPostAction(url, options, "listenersRefresh");
        },

        destroyListeners: function(ports, credentialId, region) {
            var url = "/listeners?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var options = {ports: ports};
            this.sendPostAction(url, options, "listenersRefresh");
        },

        enableAvailabilityZones: function(availabilityZones, credentialId, region) {
            var url = "/availability_zones?cred_id=" + credentialId + "&region=" + region;
            var options = {availability_zones: availabilityZones};
            this.sendPostAction(url, options, "instancesRefresh");
        },

        disableAvailabilityZones: function(availabilityZones, credentialId, region, disableTrigger) {
            var url = "/availability_zones?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var options = {availability_zones: availabilityZones};
            if(disableTrigger) {
                this.sendPostAction(url, options);
            }else {
              this.sendPostAction(url, options, "instancesRefresh");  
            }
        },

        registerInstances: function(instanceIds, credentialId, region) {
            var url = "/instances?cred_id=" + credentialId + "&region=" + region;
            var options = {instance_ids: instanceIds};
            this.sendPostAction(url, options, "instancesRefresh");
        },

        deregisterInstances: function(instanceIds, credentialId, region) {
            var url = "/instances?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            var options = {instance_ids: instanceIds};
            this.sendPostAction(url, options, "instancesRefresh");
        },

        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "loadBalancerAppRefresh";
            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }

    });

    return LoadBalancer;
});
