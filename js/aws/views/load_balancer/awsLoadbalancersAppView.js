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
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, loadBalancerAppTemplate, LoadBalancer, LoadBalancers, LoadBalancerCreate, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var AwsLoadBalancersAppView = ResourceAppView.extend({

        template: _.template(loadBalancerAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "dns_name", "instance_count", "created_at"],
        
        idColumnNumber: 0,
        
        model: LoadBalancer,
        
        collectionType: LoadBalancers,
        
        type: "load_balancer",
        
        subtype: "loadbalancers",
        
        CreateView: LoadBalancerCreate,

        healthyHostCountData: new MetricStatistics(),
        
        unhealthyHostCountData: new MetricStatistics(),
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors',
            'click #instances' : 'refreshInstancesTab'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var instanceApp = this;
            Common.vent.on("loadBalancerAppRefresh", function() {
                instanceApp.render();
            });
            this.healthyHostCountData.on( 'reset', function() {this.addMonitorGraph("#healthy_host_count", this.healthyHostCountData, ["Average"], ["Healthy Host Count"], ["#FF8000"])}, this );
            this.unhealthyHostCountData.on( 'reset', function() {this.addMonitorGraph("#unhealthy_host_count", this.unhealthyHostCountData, ["Average"], ["Unhealthy Host Count"], ["#00CC00"])}, this );
        },

        toggleActions: function(e) {
            //Disable any needed actions
        },

        refreshInstancesTab: function() {
            $("#instances_tab_content").empty();
            $("#instances_tab_content").append("<span><b>Instances:</b></span><button id='add_instance_button'>Add Instance</button><br /><br />" +
                                    "<table id='instances_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr>" +
                                                "<th>Instance</th><th>Availability Zone</th><th>State</th><th>Actions</th>" +
                                            "</tr>" +
                                        "</thead>" +
                                        "<tbody></tbody><tfoot></tfoot>" +
                                    "</table>" +
                                    "<span><b>Availability Zones:</b></span><button id='add_availability_zones_button'>Add Availability Zone</button><br /><br />" +
                                    "<table id='availability_zones_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr>" +
                                                "<th>Availability Zone</th><th>Instance Count</th><th>Healthy?</th><th>Actions</th>" +
                                            "</tr>" +
                                        "</thead>" +
                                        "<tbody></tbody><tfoot></tfoot>" +
                                    "</table>");
            $("#instances_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#availability_zones_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#add_instance_button").button();
            $("#add_availability_zones_button").button();
        },

        performAction: function(event) {
            var loadBalancer = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Load Balancer":
                loadBalancer.destroy(this.credentialId, this.region);
                break;
            }
        },
        
        refreshMonitors: function() {
            $(".monitor_graph").empty();
            var loadBalancerApp = this;
            $("#monitor_time_range").selectmenu({
                change: function() {
                    loadBalancerApp.refreshMonitors();
                }
            });
            $("#refresh_monitors_button").button();

            var spinnerOptions = {
                lines: 13, // The number of lines to draw
                length: 7, // The length of each line
                width: 4, // The line thickness
                radius: 10, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 50, // Top position relative to parent in px
                left: 211 // Left position relative to parent in px
            };

            new Spinner(spinnerOptions).spin($("#healthy_host_count").get(0));
            new Spinner(spinnerOptions).spin($("#unhealthy_host_count").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId, 
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/ELB",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "LoadBalancerName",
                dimension_value: this.selectedId
            }
            
            metricStatisticOptions.metric_name = "HealthyHostCount";
            this.healthyHostCountData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "UnHealthyHostCount";
            this.unhealthyHostCountData.fetch({ data: $.param(metricStatisticOptions) });
        },

        addMonitorGraph: function(element, collection, yKeys, labels, lineColors) {
            $(element).empty();
            var data = collection.toJSON();
            if(data.length > 0) {
                Morris.Line({
                    element: element.substr(1, element.length-1),
                    data: data,
                    xkey: 'Timestamp',
                    ykeys: yKeys,
                    labels: labels,
                    lineColors: lineColors
                });
            }else {
                $(element).html(this.emptyGraphTemplate);
            }
        },
    });
    
    return AwsLoadBalancersAppView;
});
