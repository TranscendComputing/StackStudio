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
     * @name SpotInstance
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a SpotInstance.
     */
    var SpotInstance = Backbone.Model.extend({

        /** Default attributes for spot instance */
        defaults: {
            id: '',
            price: 0.0,
            request_type: '',
            created_at: '',
            instance_count: 0,
            instance_id: '',
            state: '',
            valid_from: '',
            valid_until: '',
            launch_group: '',
            availability_zone_group: '',
            product_description: '',
            groups: [],
            key_name: '',
            availability_zone: '',
            flavor_id: '',
            image_id: '',
            monitoring: false,
            block_device_mapping: [],
            subnet_id: '',
            tags: {},
            fault: '',
            user_data: ''
        },
        
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/spot_requests/create?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, options);
        },
        
        cancel: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/spot_requests/delete?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, this.attributes);
        },
        
        sendPostAction: function(url, options) {
            var spotRequest = {"spot_request": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(spotRequest),
                success: function(data) {
                    Common.vent.trigger("spotInstanceAppRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });
    
    
    return SpotInstance;
});
