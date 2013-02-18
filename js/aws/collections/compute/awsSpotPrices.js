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
        '/js/aws/models/compute/awsSpotPrice.js',
        'common'
], function( $, Backbone, SpotPrice, Common ) {
    'use strict';

    // KeyPair Collection
    // ---------------

    var SpotPriceList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: SpotPrice,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/spot_prices/describe'
    });
    
    return SpotPriceList;

});
