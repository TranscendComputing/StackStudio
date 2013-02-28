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

    // Aws SpotPrice Model
    // ----------

    var SpotPrice = Backbone.Model.extend({

        /** Default attributes for instance */
        defaults: {
            instanceType: '',
            productDescription: '',
            spotPrice: '',
            timestamp: '',
            availabilityZone: ''
        },
        
        currentPrice: function(options, credentialId) {
            var spotPrice = this;
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/spot_prices/current?cred_id=" + credentialId;
            var filters = {"filters": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(filters),
                success: function(data) {
                    spotPrice.attributes = data;
                    Common.vent.trigger("currentPriceRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return SpotPrice;
});
