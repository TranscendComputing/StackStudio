/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/aws/cache/awsCacheClusterAppTemplate.html',
        '/js/aws/models/cache/awsCacheCluster.js',
        '/js/aws/collections/cache/awsCacheClusters.js',
        '/js/aws/views/cache/awsClusterCreateView.js',
        '/js/aws/views/cache/awsClusterModifyView.js',
        '/js/aws/collections/cloud_watch/awsMetricStatistics.js',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, cacheClusterAppTemplate, CacheCluster, CacheClusters, CacheClusterCreate, CacheClusterModify, MetricStatistics, emptyGraph, ich, Common, Morris, Spinner) {
    'use strict';

    var AwsClustersAppView = ResourceAppView.extend({
        
        template: _.template(cacheClusterAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "node_type", "engine", "zone", "num_nodes", "status"],
        
        idColumnNumber: 0,
        
        model: CacheCluster,
        
        collectionType: CacheClusters,
        
        type: "cache",
        
        subtype: "clusters",
        
        CreateView: CacheClusterCreate,
        
        ModifyView: CacheClusterModify,
        
        bytesReadIntoMemcachedData: new MetricStatistics(),
        bytesUsedForCacheItemsData: new MetricStatistics(),
        bytesWrittenOutFromMemcachedData: new MetricStatistics(),
        casBadvalData: new MetricStatistics(),
        casHitsData: new MetricStatistics(),
        casMissesData: new MetricStatistics(),
        cmdFlushData: new MetricStatistics(),
        cmdGetData: new MetricStatistics(),
        cmdSetData: new MetricStatistics(),
        currConnectionsData: new MetricStatistics(),
        currItemsData: new MetricStatistics(),
        decrHitsData: new MetricStatistics(),
        decrMissesData: new MetricStatistics(),
        deleteHitsData: new MetricStatistics(),
        deleteMissesData: new MetricStatistics(),
        evictionsData: new MetricStatistics(),
        freeableMemoryData: new MetricStatistics(),
        getHitsData: new MetricStatistics(),
        getMissesData: new MetricStatistics(),
        incrHitsData: new MetricStatistics(),
        incrMissesData: new MetricStatistics(),
        networkBytesInData: new MetricStatistics(),
        networkBytesOutData: new MetricStatistics(),
        newConnectionsData: new MetricStatistics(),
        newItemsData: new MetricStatistics(),
        reclaimedData: new MetricStatistics(),
        swapUsageData: new MetricStatistics(),
        unusedMemoryData: new MetricStatistics(),
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': 'clickOne',
            'click #modnodes': 'modNodes',
            'click #refresh_monitors_button': 'refreshMonitors',
            'click #monitoring': 'selectNode'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var cacheApp = this;
            Common.vent.on("cacheAppRefresh", function() {
                cacheApp.render();
            });
            
            this.bytesReadIntoMemcachedData.on( 'reset', function() {this.addMonitorGraph("#bytes_read", this.bytesReadIntoMemcachedData, ["Average"], ["Bytes Read Into Memcached"], ["#FF8000"]);}, this );
            this.bytesUsedForCacheItemsData.on( 'reset', function() {this.addMonitorGraph("#bytes_used", this.bytesUsedForCacheItemsData, ["Average"], ["Bytes Used For Cache Items"], ["#00CC00"]);}, this );
            this.bytesWrittenOutFromMemcachedData.on( 'reset', function() {this.addMonitorGraph("#bytes_written", this.bytesWrittenOutFromMemcachedData, ["Average"], ["Bytes Written Out From Memcached"], ["#660066"]);}, this );
            
            this.casBadvalData.on( 'reset', function() {this.addMonitorGraph("#casBadvalData", this.casBadvalData, ["Average"], ["Cas Badval"], ["#FF0000"]);}, this );
            this.casHitsData.on( 'reset', function() {this.addMonitorGraph("#casHitsData", this.casHitsData, ["Average"], ["Cas Hits"], ["#3399FF"]);}, this );
            this.casMissesData.on( 'reset', function() {this.addMonitorGraph("#casMissesData", this.casMissesData, ["Average"], ["Cas Misses"], ["#996633"]);}, this );
            
            this.cmdFlushData.on( 'reset', function() {this.addMonitorGraph("#cmdFlushData", this.cmdFlushData, ["Average"], ["Cmd Flush"], ["#FF0066"]);}, this );
            this.cmdGetData.on( 'reset', function() {this.addMonitorGraph("#cmdGetData", this.cmdGetData, ["Average"], ["Cmd Get"], ["#00CC99"]);}, this );
            this.cmdSetData.on( 'reset', function() {this.addMonitorGraph("#cmdSetData", this.cmdSetData, ["Average"], ["Cmd Set"], ["#000000"]);}, this );
            
            this.currConnectionsData.on( 'reset', function() {this.addMonitorGraph("#currConnectionsData", this.currConnectionsData, ["Average"], ["Curr Connections"], ["#999966"]);}, this );
            this.currItemsData.on( 'reset', function() {this.addMonitorGraph("#currItemsData", this.currItemsData, ["Average"], ["Curr Items"], ["#00CC00"]);}, this );
            
            this.decrHitsData.on( 'reset', function() {this.addMonitorGraph("#decrHitsData", this.decrHitsData, ["Average"], ["Decr Hits"], ["#660066"]);}, this );
            this.decrMissesData.on( 'reset', function() {this.addMonitorGraph("#decrMissesData", this.decrMissesData, ["Average"], ["Decr Misses"], ["#FF0000"]);}, this );
            this.deleteHitsData.on( 'reset', function() {this.addMonitorGraph("#deleteHitsData", this.deleteHitsData, ["Average"], ["Delete Hits"], ["#3399FF"]);}, this );
            this.deleteMissesData.on( 'reset', function() {this.addMonitorGraph("#deleteMissesData", this.deleteMissesData, ["Average"], ["Delete Misses"], ["#996633"]);}, this );
            
            this.evictionsData.on( 'reset', function() {this.addMonitorGraph("#evictionsData", this.evictionsData, ["Average"], ["Evictions"], ["#FF0066"]);}, this );
            this.freeableMemoryData.on( 'reset', function() {this.addMonitorGraph("#freeableMemoryData", this.freeableMemoryData, ["Average"], ["Freeable Memory"], ["#00CC99"]);}, this );
            this.getHitsData.on( 'reset', function() {this.addMonitorGraph("#getHitsData", this.getHitsData, ["Average"], ["Get Hits"], ["#000000"]);}, this );
            this.getMissesData.on( 'reset', function() {this.addMonitorGraph("#getMissesData", this.getMissesData, ["Average"], ["Get Misses"], ["#990033"]);}, this );
            
            this.incrHitsData.on( 'reset', function() {this.addMonitorGraph("#incrHitsData", this.incrHitsData, ["Average"], ["Incr Hits"], ["#999966"]);}, this );
            this.incrMissesData.on( 'reset', function() {this.addMonitorGraph("#incrMissesData", this.incrMissesData, ["Average"], ["Incr Misses"], ["#00CC00"]);}, this );
            
            this.networkBytesInData.on( 'reset', function() {this.addMonitorGraph("#networkBytesInData", this.networkBytesInData, ["Average"], ["Network Bytes In"], ["#660066"]);}, this );
            this.networkBytesOutData.on( 'reset', function() {this.addMonitorGraph("#networkBytesOutData", this.networkBytesOutData, ["Average"], ["Network Bytes Out"], ["#FF0000"]);}, this );
            this.newConnectionsData.on( 'reset', function() {this.addMonitorGraph("#newConnectionsData", this.newConnectionsData, ["Average"], ["New Connections"], ["#3399FF"]);}, this );
            this.newItemsData.on( 'reset', function() {this.addMonitorGraph("#newItemsData", this.newItemsData, ["Average"], ["New Items"], ["#996633"]);}, this );
            
            this.reclaimedData.on( 'reset', function() {this.addMonitorGraph("#reclaimedData", this.reclaimedData, ["Average"], ["Reclaimed"], ["#FF0066"]);}, this );
            this.swapUsageData.on( 'reset', function() {this.addMonitorGraph("#swapUsageData", this.swapUsageData, ["Average"], ["Swap Usage"], ["#00CC99"]);}, this );
            this.unusedMemoryData.on( 'reset', function() {this.addMonitorGraph("#unusedMemoryData", this.unusedMemoryData, ["Average"], ["Unused Memory"], ["#000000"]);}, this );
        },
        
        performAction: function(event) {
            var cluster = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                cluster.destroy(this.credentialId, this.region);
                break;
            case "Modify Node Count":
                if(cluster.getStatus() === "available"){
                    var ModifyView = this.ModifyView;
                    if(this.region) {
                        this.newResourceDialog = new ModifyView({cred_id: this.credentialId, region: this.region, modCluster: cluster});
                    }else {
                        this.newResourceDialog = new ModifyView({cred_id: this.credentialId});
                    }
                    this.newResourceDialog.render();
                    break;
                }
            }
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var cluster = this.collection.get(this.selectedId);
            
            if(cluster.getStatus() !== "available"){
                $("#monitoring").hide();
                this.toggleActionItem($("#mod_node_count"),true);
            }else{
                $("#monitoring").show();
                this.toggleActionItem($("#mod_node_count"),false);
            }
            
        },
        
        //Monitors
        
        refreshMonitors: function() {
            $(".monitor_graph").empty();
            var cacheApp = this;
            $("#monitor_time_range").selectmenu({
                change: function() {
                    cacheApp.refreshMonitors();
                }
            });
            $("#refresh_monitors_button").button();
            $("#node_select").selectmenu();

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

            new Spinner(spinnerOptions).spin($("#bytes_read").get(0));
            new Spinner(spinnerOptions).spin($("#bytes_used").get(0));
            new Spinner(spinnerOptions).spin($("#bytes_written").get(0));
            
            new Spinner(spinnerOptions).spin($("#casBadvalData").get(0));
            new Spinner(spinnerOptions).spin($("#casHitsData").get(0));
            new Spinner(spinnerOptions).spin($("#casMissesData").get(0));
            
            new Spinner(spinnerOptions).spin($("#cmdFlushData").get(0));
            new Spinner(spinnerOptions).spin($("#cmdGetData").get(0));
            new Spinner(spinnerOptions).spin($("#cmdSetData").get(0));
            
            new Spinner(spinnerOptions).spin($("#currConnectionsData").get(0));
            new Spinner(spinnerOptions).spin($("#currItemsData").get(0));
            
            new Spinner(spinnerOptions).spin($("#decrHitsData").get(0));
            new Spinner(spinnerOptions).spin($("#decrMissesData").get(0));
            new Spinner(spinnerOptions).spin($("#deleteHitsData").get(0));
            new Spinner(spinnerOptions).spin($("#deleteMissesData").get(0));
            
            new Spinner(spinnerOptions).spin($("#evictionsData").get(0));
            new Spinner(spinnerOptions).spin($("#freeableMemoryData").get(0));
            new Spinner(spinnerOptions).spin($("#getHitsData").get(0));
            new Spinner(spinnerOptions).spin($("#getMissesData").get(0));
            
            new Spinner(spinnerOptions).spin($("#incrHitsData").get(0));
            new Spinner(spinnerOptions).spin($("#incrMissesData").get(0));
            
            new Spinner(spinnerOptions).spin($("#networkBytesInData").get(0));
            new Spinner(spinnerOptions).spin($("#networkBytesOutData").get(0));
            new Spinner(spinnerOptions).spin($("#newConnectionsData").get(0));
            new Spinner(spinnerOptions).spin($("#newItemsData").get(0));
            
            new Spinner(spinnerOptions).spin($("#reclaimedData").get(0));
            new Spinner(spinnerOptions).spin($("#swapUsageData").get(0));
            new Spinner(spinnerOptions).spin($("#unusedMemoryData").get(0));

            var monitorTimeValue = $("#monitor_time_range").val();
            var monitorTime = JSON.parse(monitorTimeValue);

            var metricStatisticOptions = {
                cred_id: this.credentialId, 
                region: this.region,
                time_range: monitorTime.time_range, 
                namespace: "AWS/ElastiCache",
                period: monitorTime.period,
                statistic: "Average",
                //dimensions:[{"name":"CacheClusterId","value":this.selectedId},{"name":"CacheNodeId","value":$("#node_select").val()}]
                dimension_name: "CacheClusterId",
                dimension_value: this.selectedId,
                dimension_name2: "CacheNodeId",
                dimension_value2: $("#node_select").val()
            };
            
            metricStatisticOptions.metric_name = "BytesReadIntoMemcached";
            this.bytesReadIntoMemcachedData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "BytesUsedForCacheItems";
            this.bytesUsedForCacheItemsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "BytesWrittenOutFromMemcached";
            this.bytesWrittenOutFromMemcachedData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "CasBadval";
            this.casBadvalData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "CasHits";
            this.casHitsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "CasMisses";
            this.casMissesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "CmdFlush";
            this.cmdFlushData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "CmdGet";
            this.cmdGetData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "CmdSet";
            this.cmdSetData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "CurrConnections";
            this.currConnectionsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "CurrItems";
            this.currItemsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "DecrHits";
            this.decrHitsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DecrMisses";
            this.decrMissesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DeleteHits";
            this.deleteHitsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "DeleteMisses";
            this.deleteMissesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "Evictions";
            this.evictionsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "FreeableMemory";
            this.freeableMemoryData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "GetHits";
            this.getHitsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "GetMisses";
            this.getMissesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "IncrHits";
            this.incrHitsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "IncrMisses";
            this.incrMissesData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "NetworkBytesIn";
            this.networkBytesInData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "NetworkBytesOut";
            this.networkBytesOutData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "NewConnections";
            this.newConnectionsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "NewItems";
            this.newItemsData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            
            metricStatisticOptions.metric_name = "Reclaimed";
            this.reclaimedData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "SwapUsage";
            this.swapUsageData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "UnusedMemory";
            this.unusedMemoryData.fetch({ data: $.param(metricStatisticOptions), reset: true });
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
        
        selectNode: function(e) {
            var cluster = this.collection.get(this.selectedId);
            
            var detailString = "";
            
            detailString += "<br><b>CacheNodeId:</b> ";
            detailString += $("#cid"+$("#node_select").val()).html();
            detailString += "<br><b>ParameterGroupStatus:</b> ";
            detailString += $("#pgs"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeStatus:</b> ";
            detailString += $("#cns"+$("#node_select").val()).html();
            detailString += "<br><b>CacheNodeCreateTime:</b> ";
            detailString += $("#cnct"+$("#node_select").val()).html();
            detailString += "<br><b>Port:</b> ";
            detailString += $("#port"+$("#node_select").val()).html();
            detailString += "<br><b>Address:</b> ";
            detailString += $("#address"+$("#node_select").val()).html();
            
            $("#node_detail").html(detailString);
            
            this.refreshMonitors();
        },
        
        modNodes: function(e) {
            var cluster = this.collection.get(this.selectedId);
            
            var ModifyView = this.ModifyView;
            if(this.region) {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId, region: this.region, modCluster: cluster});
            }else {
                this.newResourceDialog = new ModifyView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        }
    });
    
    return AwsClustersAppView;
});
