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

    /**
     *
     * @name SecurityGroup
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SecurityGroup.
     */
    var SecurityGroup = Backbone.Model.extend({
        idAttribute: "group_id",
        
        /** Default attributes for security group */
        defaults: {
            name: '',
            description: '',
            group_id: '',
            ip_permissions: [],
            ip_permissions_egress: [],
            owner_id: '',
            vpc_id: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, options);
        },
        
        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/security_groups/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var securityGroup = {"security_group": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(securityGroup),
                success: function(data) {
                    Common.vent.trigger("securityGroupAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return SecurityGroup;
});
