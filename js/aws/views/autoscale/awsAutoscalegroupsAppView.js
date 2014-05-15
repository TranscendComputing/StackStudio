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
        'views/resource/resourceAppView',
        'views/resource/resourceRowView',
        'text!templates/aws/autoscale/awsAutoscaleAppTemplate.html',
        'aws/models/autoscale/awsAutoscaleGroup',
        'aws/collections/autoscale/awsAutoscaleGroups',
        'aws/views/autoscale/awsAutoscaleGroupCreateView',
        'aws/collections/cloud_watch/awsMetricStatistics',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, awsAutoscaleAppTemplate, AutoscaleGroup, AutoscaleGroups, AutoscaleGroupCreate, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var AwsAutoscaleAppView = ResourceAppView.extend({

        template: _.template(awsAutoscaleAppTemplate),

        modelStringIdentifier: "id",

        columns: ["id", "launch_configuration_name", "desired_capacity", "min_size", "max_size"],
        
        idColumnNumber: 0,
        
        model: AutoscaleGroup,
        
        collectionType: AutoscaleGroups,

        type: "autoscale",
        
        subtype: "autoscalegroups",

        CreateView: AutoscaleGroupCreate,

        cpuData: new MetricStatistics(),
        
        diskReadBytesData: new MetricStatistics(),
        
        diskWriteBytesData: new MetricStatistics(),
        
        networkInData: new MetricStatistics(),
        
        networkOutData: new MetricStatistics(),
        
        diskReadOpsData: new MetricStatistics(),
        
        diskWriteOpsData: new MetricStatistics(),
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var topicApp = this;
            Common.vent.on("autoscaleAppRefresh", function() {
                topicApp.render();
            });
            //CPU has its own graph function because ymax is used
            this.cpuData.on( 'reset', this.addCPUData, this );
            this.diskReadBytesData.on( 'reset', function() {this.addMonitorGraph("#disk_read_bytes", this.diskReadBytesData, ["Average"], ["Disk Read Bytes"], ["#FF8000"]);}, this );
            this.diskReadOpsData.on( 'reset', function() {this.addMonitorGraph("#disk_read_ops", this.diskReadOpsData, ["Average"], ["Disk Read Ops"], ["#00CC00"]);}, this );
            this.diskWriteBytesData.on( 'reset', function() {this.addMonitorGraph("#disk_write_bytes", this.diskWriteBytesData, ["Average"], ["Disk Write Bytes"], ["#660066"]);}, this );
            this.diskWriteOpsData.on( 'reset', function() {this.addMonitorGraph("#disk_write_ops", this.diskWriteOpsData, ["Average"], ["Disk Write Ops"], ["#FF0000"]);}, this );
            this.networkInData.on( 'reset', function() {this.addMonitorGraph("#network_in", this.networkInData, ["Average"], ["Network In Bytes"], ["#3399FF"]);}, this );
            this.networkOutData.on( 'reset', function() {this.addMonitorGraph("#network_out", this.networkOutData, ["Average"], ["Network Out Bytes"], ["#996633"]);}, this );
        },

        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var autoscaleGroup = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
                case "Spin Down Group":
                    autoscaleGroup.spinDown(this.credentialId, this.region);
                    break;
                case "Delete Group":
                    autoscaleGroup.destroy(this.credentialId, this.region);
                    break;
            }
        },

        refreshMonitors: function() {
            $(".monitor_graph").empty();
            var instanceApp = this;
            $("#monitor_time_range").change(function() {
                instanceApp.refreshMonitors();
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

            new Spinner(spinnerOptions).spin($("#cpu_utilization").get(0));
            new Spinner(spinnerOptions).spin($("#disk_read_bytes").get(0));
            new Spinner(spinnerOptions).spin($("#disk_read_ops").get(0));
            new Spinner(spinnerOptions).spin($("#disk_write_bytes").get(0));
            new Spinner(spinnerOptions).spin($("#disk_write_ops").get(0));
            new Spinner(spinnerOptions).spin($("#network_in").get(0));
            new Spinner(spinnerOptions).spin($("#network_out").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId, 
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/EC2",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "AutoScalingGroupName",
                dimension_value: this.selectedId
            };
            
            metricStatisticOptions.metric_name = "CPUUtilization";
            this.cpuData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DiskReadBytes";
            this.diskReadBytesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DiskWriteBytes";
            this.diskWriteBytesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "NetworkIn";
            this.networkInData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "NetworkOut";
            this.networkOutData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DiskReadOps";
            this.diskReadOpsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DiskWriteOps";
            this.diskWriteOpsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
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
        
        addCPUData: function() {
            $("#cpu_utilization").empty();
            Morris.Line({
                element: 'cpu_utilization',
                data: this.cpuData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                ymax: ['100'],
                labels: ['CPU'],
                lineColors: ["#000099"]
            });
        }
    });
    
    return AwsAutoscaleAppView;
});
