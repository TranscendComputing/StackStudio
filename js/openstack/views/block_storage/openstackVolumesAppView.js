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
        'text!templates/openstack/block_storage/openstackVolumeAppTemplate.html',
        '/js/openstack/models/block_storage/openstackVolume.js',
        '/js/openstack/collections/block_storage/openstackVolumes.js',
        '/js/openstack/views/block_storage/openstackVolumeCreateView.js',
        '/js/openstack/views/block_storage/openstackVolumeAttachView.js',
        '/js/openstack/views/block_storage/openstackSnapshotCreateView.js',
        '/js/openstack/collections/cloud_watch/openstackMetricStatistics.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, openstackVolumeAppTemplate, Volume, Volumes, OpenstackVolumeCreateView, OpenstackVolumeAttachView, OpenstackSnapshotCreateView, MetricStatistics, ich, Common, Morris, Spinner ) {
	'use strict';

	// Openstack Application View
	// ------------------------------

    /**
     * Openstack AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an OpenstackAppView instance.
     */
	var OpenstackVolumesAppView = AppView.extend({
	    template: _.template(openstackVolumeAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["tags.Name", "id", "size", "state"],
        
        idColumnNumber: 1,
        
        model: Volume,
        
        collectionType: Volumes,
        
        type: "block_storage",
        
        subtype: "volumes",
        
        CreateView: OpenstackVolumeCreateView,

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
            'click #monitoring': 'refreshMonitors',
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var volumeApp = this;
            Common.vent.on("volumeAppRefresh", function() {
                volumeApp.render();
            });
            this.idleTimeData.on( 'reset', this.addIdleTimeData, this );
            this.queueLengthData.on( 'reset', this.addQueueLengthData, this );
            this.readBytesData.on( 'reset', this.addReadBytesData, this );
            this.readOpsData.on( 'reset', this.addReadOpsData, this );
            this.totalReadTimeData.on( 'reset', this.addTotalReadTimeData, this );
            this.totalWriteTimeData.on( 'reset', this.addTotalWriteTimeData, this );
            this.writeBytesData.on( 'reset', this.addWriteBytesData, this );
            this.writeOpsData.on( 'reset', this.addWriteOpsData, this );
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var volume = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Volume":
                volume.destroy(this.credentialId);
                break;
            case "Attach Volume":
                new OpenstackVolumeAttachView({cred_id: this.credentialId, volume: volume});
                break;
            case "Detach Volume":
                volume.detach(this.credentialId);
                break;
            case "Force Detach":
                volume.forceDetach(this.credentialId);
                break;
            case "Create Snapshot":
                new OpenstackSnapshotCreateView({cred_id: this.credentialId, volume: volume});
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
                time_range: monitorTime.time_range, 
                namespace: "AWS/EBS",
                period: monitorTime.period,
                statistic: "Average",
                dimension_name: "VolumeId",
                dimension_value: this.selectedId
            }

            metricStatisticOptions.metric_name = "VolumeIdleTime";
            this.idleTimeData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeQueueLength";
            this.queueLengthData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeReadBytes";
            this.readBytesData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeReadOps";
            this.readOpsData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeTotalReadTime";
            this.totalReadTimeData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeTotalWriteTime";
            this.totalWriteTimeData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeWriteBytes";
            this.writeBytesData.fetch({ data: $.param(metricStatisticOptions) });
            metricStatisticOptions.metric_name = "VolumeWriteOps";
            this.writeOpsData.fetch({ data: $.param(metricStatisticOptions) });
        },

        addIdleTimeData: function() {
            $("#volume_idle_time").empty();
            Morris.Line({
                element: 'volume_idle_time',
                data: this.idleTimeData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Idle Time'],
                lineColors: ["#000099"]
            });
        },
        
        addQueueLengthData: function() {
            $("#volume_queue_length").empty();
            Morris.Line({
                element: 'volume_queue_length',
                data: this.queueLengthData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Queue Length'],
                lineColors: ["#FF8000"]
            });
        },
        
        addReadBytesData: function() {
            $("#volume_read_bytes").empty();
            Morris.Line({
                element: 'volume_read_bytes',
                data: this.readBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Read Bytes'],
                lineColors: ["#009900"]
            });
        },
        
        addReadOpsData: function() {
            $("#volume_read_ops").empty();
            Morris.Line({
                element: 'volume_read_ops',
                data: this.readOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Read Ops'],
                lineColors: ["#660066"]
            });
        },
        
        addTotalReadTimeData: function() {
            $("#volume_total_read_time").empty();
            Morris.Line({
                element: 'volume_total_read_time',
                data: this.totalReadTimeData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Total Read Time'],
                lineColors: ["#FF0000"]
            });
        },
        
        addTotalWriteTimeData: function() {
            $("#volume_total_write_time").empty();
            Morris.Line({
                element: 'volume_total_write_time',
                data: this.totalWriteTimeData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Total Write Time'],
                lineColors: ["#3399FF"]
            });
        },
        
        addWriteBytesData: function() {
            $("#volume_write_bytes").empty();
            Morris.Line({
                element: 'volume_write_bytes',
                data: this.writeBytesData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Write Bytes'],
                lineColors: ["#996633"]
            });
        },

        addWriteOpsData: function() {
            $("#volume_write_ops").empty();
            Morris.Line({
                element: 'volume_write_ops',
                data: this.writeOpsData.toJSON(),
                xkey: 'Timestamp',
                ykeys: ['Average'],
                labels: ['Write Ops'],
                lineColors: ["#FF0066"]
            });
        }
	});
    
	return OpenstackVolumesAppView;
});
