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
        'text!templates/aws/rds/awsRelationalDatabaseAppTemplate.html',
        '/js/aws/models/rds/awsRelationalDatabase.js',
        '/js/aws/collections/rds/awsRelationalDatabases.js',
        '/js/aws/views/rds/awsRelationalDatabaseCreateView.js',
        '/js/aws/collections/cloud_watch/awsMetricStatistics.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, relationalDatabaseAppTemplate, RelationalDatabase, RelationalDatabases, RelationalDatabaseCreate, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
    'use strict';

    var AwsRdsAppView = ResourceAppView.extend({
        
        template: _.template(relationalDatabaseAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "flavor_id", "allocated_storage", "engine", "availability_zone", "state"],
        
        idColumnNumber: 0,
        
        model: RelationalDatabase,
        
        collectionType: RelationalDatabases,
        
        type: "rds",
        
        subtype: "relationaldatabases",
        
        CreateView: RelationalDatabaseCreate,

        cpuData: new MetricStatistics(),
        
        dbConnectionsData: new MetricStatistics(),
        
        freeableMemoryData: new MetricStatistics(),
        
        freeableSpaceData: new MetricStatistics(),
        
        readIopsData: new MetricStatistics(),

        readLatencyData: new MetricStatistics(),

        readThroughputData: new MetricStatistics(),

        replicaLagData: new MetricStatistics(),

        swapUsageData: new MetricStatistics(),

        writeIopsData: new MetricStatistics(),

        writeLatencyData: new MetricStatistics(),
        
        writeThroughputData: new MetricStatistics(),
        
        queueDepthData: new MetricStatistics(),
        
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
            
            var rdsApp = this;
            Common.vent.on("rdsAppRefresh", function() {
                rdsApp.render();
            });
            //CPU has its own graph function because ymax is used
            this.cpuData.on( 'reset', this.addCPUData, this );
            this.dbConnectionsData.on( 'reset', function() {this.addMonitorGraph("#database_connections", this.dbConnectionsData, ["Average"], ["Database Connections"], ["#FF8000"]);}, this );
            this.freeableMemoryData.on( 'reset', function() {this.addMonitorGraph("#freeable_memory", this.freeableMemoryData, ["Average"], ["Freeable Memory"], ["#00CC00"]);}, this );
            this.freeableSpaceData.on( 'reset', function() {this.addMonitorGraph("#free_storage_space", this.freeableSpaceData, ["Average"], ["Freeable Space"], ["#660066"]);}, this );
            this.readIopsData.on( 'reset', function() {this.addMonitorGraph("#read_iops", this.readIopsData, ["Average"], ["Read Iops"], ["#FF0000"]);}, this );
            this.readLatencyData.on( 'reset', function() {this.addMonitorGraph("#read_latency", this.readLatencyData, ["Average"], ["Read Latency"], ["#3399FF"]);}, this );
            this.readThroughputData.on( 'reset', function() {this.addMonitorGraph("#read_throughput", this.readThroughputData, ["Average"], ["Read Throughput"], ["#996633"]);}, this );
            this.swapUsageData.on( 'reset', function() {this.addMonitorGraph("#swap_usage", this.swapUsageData, ["Average"], ["Swap Usage"], ["#FF0066"]);}, this );
            this.writeIopsData.on( 'reset', function() {this.addMonitorGraph("#write_iops", this.writeIopsData, ["Average"], ["Write Iops"], ["#00CC99"]);}, this );
            this.writeLatencyData.on( 'reset', function() {this.addMonitorGraph("#write_latency", this.writeLatencyData, ["Average"], ["Write Latency"], ["#000000"]);}, this );
            this.writeThroughputData.on( 'reset', function() {this.addMonitorGraph("#write_throughput", this.writeThroughputData, ["Average"], ["Write Throughput"], ["#990033"]);}, this );
            this.queueDepthData.on( 'reset', function() {this.addMonitorGraph("#disk_queue_depth", this.queueDepthData, ["Average"], ["Queue Depth"], ["#999966"]);}, this );
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var rds = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                rds.destroy(this.credentialId, this.region);
                break;
            }
        },

        refreshMonitors: function() {
            $(".monitor_graph").empty();
            var instanceApp = this;
            $("#monitor_time_range").selectmenu({
                change: function() {
                    instanceApp.refreshMonitors();
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

            new Spinner(spinnerOptions).spin($("#cpu_utilization").get(0));
            new Spinner(spinnerOptions).spin($("#database_connections").get(0));
            new Spinner(spinnerOptions).spin($("#freeable_memory").get(0));
            new Spinner(spinnerOptions).spin($("#free_storage_space").get(0));
            new Spinner(spinnerOptions).spin($("#read_iops").get(0));
            new Spinner(spinnerOptions).spin($("#read_latency").get(0));
            new Spinner(spinnerOptions).spin($("#read_throughput").get(0));
            new Spinner(spinnerOptions).spin($("#swap_usage").get(0));
            new Spinner(spinnerOptions).spin($("#write_iops").get(0));
            new Spinner(spinnerOptions).spin($("#write_latency").get(0));
            new Spinner(spinnerOptions).spin($("#write_throughput").get(0));
            new Spinner(spinnerOptions).spin($("#disk_queue_depth").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId, 
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/RDS",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "DBInstanceIdentifier",
                dimension_value: this.selectedId
            };
            
            metricStatisticOptions.metric_name = "CPUUtilization";
            this.cpuData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DatabaseConnections";
            this.dbConnectionsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "FreeableMemory";
            this.freeableMemoryData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "FreeStorageSpace";
            this.freeableSpaceData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "ReadIOPS";
            this.readIopsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "ReadLatency";
            this.readLatencyData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "ReadThroughput";
            this.readThroughputData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "SwapUsage";
            this.swapUsageData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "WriteIOPS";
            this.writeIopsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "WriteLatency";
            this.writeLatencyData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "WriteThroughput";
            this.writeThroughputData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DiskQueueDepth";
            this.queueDepthData.fetch({ data: $.param(metricStatisticOptions), reset: true });
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

    return AwsRdsAppView;
});
