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
        'text!templates/aws/block_storage/awsVolumeAppTemplate.html',
        'aws/models/block_storage/awsVolume',
        'aws/collections/block_storage/awsVolumes',
        'aws/views/block_storage/awsVolumeCreateView',
        'aws/views/block_storage/awsVolumeAttachView',
        'aws/views/block_storage/awsSnapshotCreateView',
        'aws/collections/cloud_watch/awsMetricStatistics',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, volumeAppTemplate, Volume, Volumes, VolumeCreateView, VolumeAttachView, SnapshotCreateView, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
	'use strict';

	var AwsVolumesAppView = AppView.extend({
	    template: _.template(volumeAppTemplate),

        emptyGraphTemplate: _.template(emptyGraph),
	    
        modelStringIdentifier: "id",
        
        columns: ["tags.Name", "id", "size", "state"],
        
        idColumnNumber: 1,
        
        model: Volume,
        
        collectionType: Volumes,
        
        type: "block_storage",
        
        subtype: "volumes",
        
        CreateView: VolumeCreateView,

        idleTimeData: new MetricStatistics(),
        
        queueLengthData: new MetricStatistics(),
        
        readBytesData: new MetricStatistics(),
        
        readOpsData: new MetricStatistics(),
        
        totalReadTimeData: new MetricStatistics(),
        
        totalWriteTimeData: new MetricStatistics(),
        
        writeBytesData: new MetricStatistics(),

        writeOpsData: new MetricStatistics(),
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors'
        },

        createButton: true,
        createText: "Create Volume",

        actions: [
            { text: "Delete Volume", type: "row"},
            { text: "Attach Volume", type: "row"},
            { text: "Detach Volume", type: "row"},
            { text: "Force Detach", type: "row"},
            { text: "Create Snapshot", type: "row"}
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }

            this.$el.html(this.template);

            this.loadData({render: true});
            
            var volumeApp = this;
            Common.vent.on("volumeAppRefresh", function() {
                volumeApp.render();
            });

            this.idleTimeData.on( 'reset', function() {this.addMonitorGraph("#volume_idle_time", this.idleTimeData, ["Average"], ["Idle Time"], ["#000099"]);}, this );
            this.queueLengthData.on( 'reset', function() {this.addMonitorGraph("#volume_queue_length", this.queueLengthData, ["Average"], ["Queue Length"], ["#FF8000"]);}, this );
            this.readBytesData.on( 'reset', function() {this.addMonitorGraph("#volume_read_bytes", this.readBytesData, ["Average"], ["Read Bytes"], ["#00CC00"]);}, this );
            this.readOpsData.on( 'reset', function() {this.addMonitorGraph("#volume_read_ops", this.readOpsData, ["Average"], ["Read Ops"], ["#660066"]);}, this );
            this.totalReadTimeData.on( 'reset', function() {this.addMonitorGraph("#volume_total_read_time", this.totalReadTimeData, ["Average"], ["Total Read Time"], ["#FF0000"]);}, this );
            this.totalWriteTimeData.on( 'reset', function() {this.addMonitorGraph("#volume_total_write_time", this.totalWriteTimeData, ["Average"], ["Total Write Time"], ["#3399FF"]);}, this );
            this.writeBytesData.on( 'reset', function() {this.addMonitorGraph("#volume_write_bytes", this.writeBytesData, ["Average"], ["Write Bytes"], ["#996633"]);}, this );
            this.writeOpsData.on( 'reset', function() {this.addMonitorGraph("#volume_write_ops", this.writeOpsData, ["Average"], ["Write Ops"], ["#FF0066"]);}, this );
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var volume = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Volume":
                volume.destroy(this.credentialId, this.region);
                break;
            case "Attach Volume":
                new VolumeAttachView({cred_id: this.credentialId, region: this.region, volume: volume});
                break;
            case "Detach Volume":
                volume.detach(this.credentialId, this.region);
                break;
            case "Force Detach":
                volume.forceDetach(this.credentialId, this.region);
                break;
            case "Create Snapshot":
                new SnapshotCreateView({cred_id: this.credentialId, region: this.region, volume: volume});
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

            new Spinner(spinnerOptions).spin($("#volume_idle_time").get(0));
            new Spinner(spinnerOptions).spin($("#volume_queue_length").get(0));
            new Spinner(spinnerOptions).spin($("#volume_read_bytes").get(0));
            new Spinner(spinnerOptions).spin($("#volume_read_ops").get(0));
            new Spinner(spinnerOptions).spin($("#volume_total_read_time").get(0));
            new Spinner(spinnerOptions).spin($("#volume_total_write_time").get(0));
            new Spinner(spinnerOptions).spin($("#volume_write_bytes").get(0));
            new Spinner(spinnerOptions).spin($("#volume_write_ops").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId,
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/EBS",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "VolumeId",
                dimension_value: this.selectedId
            };

            metricStatisticOptions.metric_name = "VolumeIdleTime";
            this.idleTimeData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "VolumeQueueLength";
            this.queueLengthData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeReadBytes";
            this.readBytesData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeReadOps";
            this.readOpsData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeTotalReadTime";
            this.totalReadTimeData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeTotalWriteTime";
            this.totalWriteTimeData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeWriteBytes";
            this.writeBytesData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
            metricStatisticOptions.metric_name = "VolumeWriteOps";
            this.writeOpsData.fetch({ data: $.param(metricStatisticOptions), reset: true  });
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
        }
	});
    
	return AwsVolumesAppView;
});
