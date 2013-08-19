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

    var Firewall = ResourceModel.extend({

        defaults: {
            id: '',
            name: ''
        },
        
        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/firewalls?&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"firewall": options}, "firewallAppRefresh");
        },
        
        delete: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/google/compute/firewalls/" + this.attributes.name + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "firewallAppRefresh");
        }
    });

    return Firewall;
});
