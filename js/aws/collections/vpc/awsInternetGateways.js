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
        '/js/aws/models/vpc/awsInternetGateway.js',
        'common'
], function( $, Backbone, InternetGateway, Common ) {
    'use strict';

    // InternetGateway Collection
    // ---------------

    var InternetGatewaysList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: InternetGateway,

        url: 'samples/internetGateways.json'
        
    });

    // Create our global collection of **InternetGateways**.
    return new InternetGatewaysList();

});
