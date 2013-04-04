/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'
], function( $, Backbone, Common ) {
    'use strict';

    /**
     *
     * @name ReservedInstance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a ReservedInstance.
     */
    var ReservedInstance = Backbone.Model.extend({

        /** Default attributes for reserved instance */
        defaults: {
            reservedInstancesId: '',
            instanceType: '',
            availabilityZone: '',
            duration: '',
            fixedPrice: '',
            usagePrice: '',
            instanceCount: '',
            productDescription: '',
            start: '',
            state: ''
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/reserved_instances/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, options);
        },
        
        sendPostAction: function(url, options) {
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger("");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return ReservedInstance;
});
