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
        'text!templates/aws/compute/awsInstanceAppTemplate.html',
        '/js/aws/models/compute/awsInstance.js',
        '/js/aws/collections/compute/awsInstances.js',
        '/js/aws/views/compute/awsInstanceCreateView.js',
        '/js/aws/collections/cloud_watch/awsMetricStatistics.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsInstanceAppTemplate, Instance, Instances, AwsInstanceCreate, MetricStatistics, ich, Common, Morris, Spinner ) {
    'use strict';

    // Aws Instance Application View
    // ------------------------------

    /**
     * AwsInstancesAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsInstancesAppView instance.
     */
    var AwsInstancesAppView = ResourceAppView.extend({
        
        template: _.template(awsInstanceAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["tags.Name", "id", "image_id", "root_device_type", "flavor_id", "key_name", "state"],
        
        idColumnNumber: 1,
        
        model: Instance,
        
        collectionType: Instances,
        
        type: "compute",
        
        subtype: "instances",
        
        CreateView: AwsInstanceCreate,
        
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
            this.render();
            
            var instanceApp = this;
            Common.vent.on("instanceAppRefresh", function() {
                instanceApp.render();
            });
            this.cpuData.on( 'reset', this.addCPUData, this );
            this.diskReadBytesData.on( 'reset', this.addDiskReadBytesData, this );
            this.diskReadOpsData.on( 'reset', this.addDiskReadOpsData, this );
            this.diskWriteBytesData.on( 'reset', this.addDiskWriteBytesData, this );
            this.diskWriteOpsData.on( 'reset', this.addDiskWriteOpsData, this );
            this.networkInData.on( 'reset', this.addNetworkInData, this );
            this.networkOutData.on( 'reset', this.addNetworkOutData, this );
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var instance = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Start":
                instance.start(this.credentialId);
                break;
            case "Stop":
                instance.stop(this.credentialId);
                break;
            case "Reboot":
                instance.reboot(this.credentialId);
                break;
            case "Terminate":
                instance.terminate(this.credentialId);
                break;
            case "Disassociate Address":
                instance.disassociateAddress(this.credentialId);
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
                time_range: monitorTime.time_range, 
                namespace: "AWS/EC2",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "InstanceId",
                dimension_value: this.selectedId
            }
            
            metricStatisticOptions.metric_name = "CPUUtilization";
            this.cpuData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "DiskReadBytes";
            this.diskReadBytesData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "DiskWriteBytes";
            this.diskWriteBytesData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "NetworkIn";
            this.networkInData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "NetworkOut";
            this.networkOutData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "DiskReadOps";
            this.diskReadOpsData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "DiskWriteOps";
            this.diskWriteOpsData.fetch({ data: $.param(metricStatisticOptions) });
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
        },
        
        addDiskReadBytesData: function() {
            $("#disk_read_bytes").empty();
            Morris.Line({
                element: 'disk_read_bytes',
                data: this.diskReadBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Read Bytes'],
                lineColors: ["#FF8000"]
            });
        },
        
        addDiskReadOpsData: function() {
            $("#disk_read_ops").empty();
            Morris.Line({
                element: 'disk_read_ops',
                data: this.diskReadOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Read Ops'],
                lineColors: ["#009900"]
            });
        },
        
        addDiskWriteBytesData: function() {
            $("#disk_write_bytes").empty();
            Morris.Line({
                element: 'disk_write_bytes',
                data: this.diskWriteBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Write Bytes'],
                lineColors: ["#660066"]
            });
        },
        
        addDiskWriteOpsData: function() {
            $("#disk_write_ops").empty();
            Morris.Line({
                element: 'disk_write_ops',
                data: this.diskWriteOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Write Ops'],
                lineColors: ["#FF0000"]
            });
        },
        
        addNetworkInData: function() {
            $("#network_in").empty();
            Morris.Line({
                element: 'network_in',
                data: this.networkInData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Network In Bytes'],
                lineColors: ["#3399FF"]
            });
        },
        
        addNetworkOutData: function() {
            $("#network_out").empty();
            Morris.Line({
                element: 'network_out',
                data: this.networkOutData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Network Out Bytes'],
                lineColors: ["#996633"]
            });
        }
    });

    return AwsInstancesAppView;
});
