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
        'text!templates/openstack/compute/openstackInstanceAppTemplate.html',
        '/js/openstack/models/compute/openstackInstance.js',
        '/js/openstack/collections/compute/openstackInstances.js',
        '/js/openstack/views/compute/openstackInstanceCreateView.js',
        '/js/topstack/collections/cloud_watch/topstackMetricStatistics.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackInstanceAppTemplate, Instance, Instances, OpenstackInstanceCreate, MetricStatistics, ich, Common, Morris, Spinner ) {
    'use strict';

    // Openstack Instance Application View
    // ------------------------------

    /**
     * OpenstackInstancesAppView is UI view list of cloud instances.
     *
     * @name InstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a OpenstackInstancesAppView instance.
     */
    var OpenstackInstancesAppView = ResourceAppView.extend({
        
        template: _.template(openstackInstanceAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "key_name", "state"],
        
        idColumnNumber: 1,
        
        model: Instance,
        
        collectionType: Instances,
        
        type: "compute",
        
        subtype: "instances",
        
        CreateView: OpenstackInstanceCreate,
        
        initialMonitorLoad: false,
        
        cpuData: new MetricStatistics(),
        
        diskReadBytesData: new MetricStatistics(),
        
        diskWriteBytesData: new MetricStatistics(),
        
        networkInData: new MetricStatistics(),
        
        networkOutData: new MetricStatistics(),
        
        diskReadOpsData: new MetricStatistics(),
        
        diskWriteOpsData: new MetricStatistics(),
        
        /** @type {Object} Event listeners for current Vuew */
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors'
        },

        /**
         * [initialize description]
         * Initializes new OpenstackInstancesAppView and sets app event listeners
         * @param  {Hash} options
         * @return {nil}
         */
        initialize: function(options) {
            if(options.region) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
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
        /**
         * [toggleActions description]
         * Toggles instance descrition view
         * @param  {Event} e
         * @return {nil}
         */
        toggleActions: function(e) {
            this.unloadMonitors();
            //Disable any needed actions
            var instance = this.collection.get(this.selectedId);
            var actionsMenu = $("#action_menu").menu("option", "menus");
            _.each($("#action_menu").find(actionsMenu).find("li"), function(item){
                var actionItem = $(item);
                if(actionItem.text() === "Disassociate Address")
                {
                    this.toggleActionItem(actionItem, (instance.get("addresses").private && instance.get("addresses").private.length < 2));
                }
                if(actionItem.text() === "Terminate")
                {
                    //TODO: Disable terminate under certain conditions   
                }
                if(actionItem.text() === "Start")
                {
                    this.toggleActionItem(actionItem, instance.get("state") !== "PAUSED");
                }
                if(actionItem.text() === "Stop" || actionItem.text() === "Reboot")
                {
                    this.toggleActionItem(actionItem, instance.get("state") !== "ACTIVE");
                }
            }, this);
            this.setAddressesDisplay(instance);
        },

        setAddressesDisplay: function(instance) {
            var addressesString = "";
            $.each(instance.attributes.addresses, function(key, value) {
                var addrString = "";
                $.each(value, function(index, arrayValue) {
                    addrString = addrString + " " + arrayValue["addr"];
                });
                var formatVariable = "";
                if(addressesString !== "") {
                    formatVariable = "<br />";
                }
                addressesString = addressesString + formatVariable + key + ": " + addrString + "\n";
            });
            $("#addresses_display").html(addressesString);
        },
        /**
         * [performAction description]
         * Performs API action on instance
         * @param  {Event} event Click event of action button
         * @return {nil}
         */
        performAction: function(event) {
            var instance = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Start":
                instance.unpause(this.credentialId);
                break;
            case "Stop":
                instance.pause(this.credentialId);
                break;
            case "Reboot":
                instance.reboot(this.credentialId);
                break;
            case "Terminate":
                instance.terminate(this.credentialId);
                break;
            /*
            case "Disassociate Address":
                var address = instance.get("addresses").private[1].addr;
                instance.disassociateAddress(address, this.credentialId);
                break;
            */
            }
        },
        /**
         * [unloadMonitors description]
         * Removes all dom elements for monitoring graphs
         * @return {nil}
         */
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
        /**
         * [refreshMonitors description]
         * Pulls instance monitoring data
         * @return {nil}
         */
        refreshMonitors: function() {
            if(!this.initialMonitorLoad) {
                var metricStatisticOptions = {
                    cred_id: this.credentialId,
                    time_range: "10800", 
                    namespace: "AWS/EC2",
                    period: "300",
                    statistic: "Average",
                    dimension_name: "InstanceId",
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

    return OpenstackInstancesAppView;
});
