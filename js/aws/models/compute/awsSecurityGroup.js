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
        'models/resource/resourceModel',
        'common'
], function( $, _, ResourceModel, Common ) {
    'use strict';

    var SecurityGroup = ResourceModel.extend({
        idAttribute: "group_id",
        
        defaults: {
            name: '',
            description: '',
            group_id: '',
            ip_permissions: [],
            ip_permissions_egress: [],
            owner_id: '',
            vpc_id: '',
            rules: []
        },
        
        parse: function(data) {
            var source, port;
            data.rules = [];
            _.each(data.ip_permissions, function(rule) {
                var r = {};
                // If group is empty, set source to ip_range
                // Otherwise, set source to group
                r.source = $.isEmptyObject(rule.groups) ? rule.ipRanges[0].cidrIp : rule.groups[0].name;
                // If from_ and to_ ports are same, set port = to from_port
                // Otherwise, set port to range
                r.port = (rule.fromPort === rule.toPort) ? rule.fromPort : rule.fromPort + "-" + rule.toPort;
                r.action = '<a class="delete_rule" href="">Delete</a>';
                r.ip_protocol = rule.ipProtocol;
                data.rules.push(r);
            });
            return data;
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"security_group": options}, "securityGroupAppRefresh");
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/" + this.attributes.group_id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "securityGroupAppRefresh");
        },
        
        addRule: function(rule, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/" + this.id + "/add_rule?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, {rule: rule}, "securityGroup:ruleAdded");
        },

        deleteRule: function(data, credentialId) {
            delete data['action'];
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/" + this.id + "/delete_rule?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, {'options': data}, "securityGroup:ruleDeleted");
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
