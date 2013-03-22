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
        '/js/aws/models/load_balancer/awsLoadBalancer.js',
        'common'
], function( $, Backbone, LoadBalancer, Common ) {
    'use strict';


    var LoadBalancerList = Backbone.Collection.extend({

        model: LoadBalancer,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/load_balancer/load_balancers/describe'
        
    });

    return LoadBalancerList;

});
