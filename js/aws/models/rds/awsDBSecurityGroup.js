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

    var DBSecurityGroup = ResourceModel.extend({

        defaults: {
            id: '',
            description: '',
            ec2_security_groups: [],
            ip_ranges: [],
            owner_id: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"security_group": options}, "securityGroupAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "securityGroupAppRefresh");
        },
        
        addCIDR: function(cidr_val,credentialId, region){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups/"+this.attributes.id+"/ipranges?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"cidrip": cidr_val}, "securityGroupAppRefresh","CIDR Block Authorized");
        },
        
        addNovaGroup: function(group_val,credentialId, region){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups/"+this.attributes.id+"/ec2_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"ec2_group": group_val}, "securityGroupAppRefresh","Nova Group Authorized");
        },
        
        revokeCIDR: function(cidr_val,credentialId, region){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups/"+this.attributes.id+"/revoke_ipranges?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"cidrip": cidr_val}, "securityGroupAppRefresh","CIDR Block Revoked");
        },
        
        revokeNovaGroup: function(group_val,credentialId, region){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/security_groups/"+this.attributes.id+"/revoke_ec2_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"ec2_group": group_val}, "securityGroupAppRefresh","Nova Group Revoked");
        }

    });

    return DBSecurityGroup;
});
