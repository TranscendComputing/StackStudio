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

    var HostedZone = Backbone.Model.extend({

        /** Default attributes for hosted zone */
        defaults: {
            id: '',
            caller_reference: '',
            change_info: '',
            description: '',
            domain: '',
            nameservers: ''
        },

        create: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/dns/hosted_zones/create?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        destroy: function(credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/dns/hosted_zones/delete?_method=DELETE&cred_id=" + credentialId;
            this.sendPostAction(url, this.attributes);
        },

        sendPostAction: function(url, options) {
            var instance = {"hosted_zone": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(instance),
                success: function(data) {
                    Common.vent.trigger("hostedZoneAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return HostedZone;
});
