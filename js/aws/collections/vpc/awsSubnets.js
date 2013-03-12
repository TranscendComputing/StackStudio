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
        '/js/aws/models/vpc/awsSubnet.js',
        'common'
], function( $, Backbone, Subnet, Common ) {
    'use strict';

    // Subnet Collection
    // ---------------

    var SubnetsList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Subnet,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/subnets/describe'
        
    });

    // Create our global collection of **Subnets**.
    return SubnetsList;

});
