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
        
        initialMonitorLoad: false,
        
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
            'click #resource_table tr': "toggleActions",
            'click #monitoring': 'refreshMonitors',
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
            this.clickOne(e);
            this.unloadMonitors();
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
        
        unloadMonitors: function() {
            if(this.initialMonitorLoad) {
                $("#cpuGraph").empty();
                $("#diskReadBytesGraph").empty();
                $("#diskReadOpsGraph").empty();
                $("#diskWriteBytesGraph").empty();
                $("#diskWriteOpsGraph").empty();
                $("#networkInGraph").empty();
                $("#networkOutGraph").empty();
                this.initialMonitorLoad = false;
            }
        },
        
        refreshMonitors: function() {
            if(!this.initialMonitorLoad) {
                /*
                var opts = {
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
                        top: 'auto', // Top position relative to parent in px
                        left: 'auto' // Left position relative to parent in px
                };
                new Spinner(opts).spin($("#cpuGraph"));
                new Spinner(opts).spin($("#diskReadGraph"));
                */
                
                var metricStatisticOptions = {
                    cred_id: this.credentialId, 
                    time_range: "10800", 
                    namespace: "AWS/EC2",
                    period: "300",
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
                
                this.initialMonitorLoad = true;
            }
        },
        
        addCPUData: function() {
            Morris.Line({
                element: 'cpuGraph',
                data: this.cpuData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                ymax: ['100'],
                labels: ['CPU'],
                lineColors: ["#000099"]
            });
        },
        
        addDiskReadBytesData: function() {
            Morris.Line({
                element: 'diskReadBytesGraph',
                data: this.diskReadBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Read Bytes'],
                lineColors: ["#FF8000"]
            });
        },
        
        addDiskReadOpsData: function() {
            Morris.Line({
                element: 'diskReadOpsGraph',
                data: this.diskReadOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Read Ops'],
                lineColors: ["#009900"]
            });
        },
        
        addDiskWriteBytesData: function() {
            Morris.Line({
                element: 'diskWriteBytesGraph',
                data: this.diskWriteBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Write Bytes'],
                lineColors: ["#660066"]
            });
        },
        
        addDiskWriteOpsData: function() {
            Morris.Line({
                element: 'diskWriteOpsGraph',
                data: this.diskWriteOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Disk Write Ops'],
                lineColors: ["#FF0000"]
            });
        },
        
        addNetworkInData: function() {
            Morris.Line({
                element: 'networkInGraph',
                data: this.networkInData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Network In Bytes'],
                lineColors: ["#3399FF"]
            });
        },
        
        addNetworkOutData: function() {
            Morris.Line({
                element: 'networkOutGraph',
                data: this.networkOutData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Network Out Bytes'],
                lineColors: ["#FF0066"]
            });
        }
    });

    return AwsInstancesAppView;
});
