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
        'topstack/models/load_balancer/topstackLoadBalancer',
        'common'
], function( $, Backbone, LoadBalancer, Common ) {
    'use strict';


    var LoadBalancerList = Backbone.Collection.extend({

        model: LoadBalancer,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/load_balancer/load_balancers'
        
    });

    return LoadBalancerList;

});
