/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        '/js/openstack/models/compute/openstackSecurityGroupRule.js'
], function( $, _, Backbone, Common ) {
    'use strict';   

    Backbone.emulateHTTP = true;
    /**
     *
     * @name SecurityGroup
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SecurityGroup.
     */
    var SecurityGroup = Backbone.Model.extend({
        /** Default attributes for security group */
        defaults: {
            name: 'MySecurityGroup',
            description: 'New security group',
            rules: []
        },

        parse: function(data) {
            var source, port;
            _.each(data.rules, function(rule) {
                // If group is empty, set source to ip_range
                // Otherwise, set source to group
                rule.source = $.isEmptyObject(rule.group) ? rule.ip_range.cidr : rule.group.name;
                // If from_ and to_ ports are same, set port = to from_port
                // Otherwise, set port to range
                rule.port = (rule.from_port === rule.to_port) ? rule.from_port : rule.from_port + "-" + rule.to_port;
                rule.action = '<a class="delete_rule" href="">Delete</a>';
            });
            return data;
        },
        
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/security_groups?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, {security_group: options});
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/security_groups?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, {security_group: {id: this.id}});
        },

        addRule: function(rule, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/security_groups/" + this.id + "/add_rule?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, {rule: rule}, "securityGroup:ruleAdded");
        },

        deleteRule: function(ruleId, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/compute/security_groups/delete_rule?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, {group_id: this.id, rule_id: ruleId}, "securityGroup:ruleDeleted");
        },
        
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "securityGroupAppRefresh";
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger, data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return SecurityGroup;
});
