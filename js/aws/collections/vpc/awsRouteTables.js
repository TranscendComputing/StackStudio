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
        'aws/models/vpc/awsRouteTable',
        'common'
], function( $, Backbone, RouteTable, Common ) {
    'use strict';

    // RouteTable Collection
    // ---------------

    var RouteTablesList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: RouteTable,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/route_tables'
    });

    // Create our global collection of **RouteTables**.
    return RouteTablesList;

});
