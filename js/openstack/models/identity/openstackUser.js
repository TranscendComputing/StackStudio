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

    var User = ResourceModel.extend({

        defaults: {
            id: '',
            email: '',
            enabled: '',
            name: '',
            tenantId: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/identity/users?cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"user": options}, "userAppRefresh");
        },
        
        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/openstack/identity/users/"+ this.attributes.id +"?_method=DELETE&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", undefined, "userAppRefresh");
        }
    });

    return User;
});
