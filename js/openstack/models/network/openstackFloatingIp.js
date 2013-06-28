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

    var FloatingIp = ResourceModel.extend({

        validate: function(attrs, options) {
            if(attrs.name === "" || attrs.name === undefined)
            {
                return this.validationError;
            }
        },

        create: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/network/floating_ips?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"floating_ip": this.attributes}, "floatingIpAppRefresh");
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/network/floating_ips/"+ this.attributes.id +"?_method=DELETE&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "floatingIpAppRefresh");
        }
    });

    return FloatingIp;
});
