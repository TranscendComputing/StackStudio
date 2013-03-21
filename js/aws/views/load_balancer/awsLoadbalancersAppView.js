/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/resourceAppView',
        'text!templates/aws/load_balancer/awsLoadBalancerAppTemplate.html',
        '/js/aws/models/load_balancer/awsLoadBalancer.js',
        '/js/aws/collections/load_balancer/awsLoadBalancers.js',
        '/js/aws/views/load_balancer/awsLoadBalancerCreateView.js',
        '/js/aws/collections/cloud_watch/awsMetricStatistics.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, loadBalancerAppTemplate, LoadBalancer, LoadBalancers, LoadBalancerCreate, MetricStatistics, emptyGraph, ich, Common ) {
    'use strict';

    var AwsLoadBalancersAppView = ResourceAppView.extend({

        template: _.template(loadBalancerAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "dns_name", "instance_count", "created_at"],
        
        idColumnNumber: 1,
        
        model: LoadBalancer,
        
        collectionType: LoadBalancers,
        
        type: "load_balancer",
        
        subtype: "loadbalancers",
        
        CreateView: AwsInstanceCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            var featureNotImplemented = new FeatureNotImplementedView({feature_url: "https://github.com/TranscendComputing/StackStudio/issues/8", element: "#resource_app"});
            featureNotImplemented.render();
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        }
    });
    
    return AwsLoadBalancersAppView;
});
