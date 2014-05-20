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
        'text!templates/aws/load_balancer/awsLoadBalancerAppTemplate.html',
        'aws/models/load_balancer/awsLoadBalancer',
        'aws/collections/load_balancer/awsLoadBalancers',
        'aws/views/load_balancer/awsLoadBalancerCreateView',
        'aws/views/load_balancer/awsRegisterInstancesView',
        'aws/views/load_balancer/awsManageAvailabilityZonesView',
        'aws/collections/load_balancer/awsListeners',
        'aws/collections/cloud_watch/awsMetricStatistics',
        'text!templates/emptyGraphTemplate.html',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, loadBalancerAppTemplate, LoadBalancer, LoadBalancers, LoadBalancerCreate, RegisterInstance, ManageAvailabilityZones, Listeners, 
    MetricStatistics, emptyGraph, ich, Common, Morris, Spinner ) {
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

        listeners: undefined,

        healthyHostCountData: new MetricStatistics(),
        
        unhealthyHostCountData: new MetricStatistics(),

        reselectTab: false,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #monitoring': 'refreshMonitors',
            'click #refresh_monitors_button': 'refreshMonitors',
            'click #instances' : 'refreshInstancesTab',
            'click #listeners' : 'refreshListenersTab',
            'click #listener_save_button': 'saveListener',
            'click a.remove_listener' : 'removeListener',
            'click a.remove_instance' : 'removeInstance',
            'click a.remove_availability_zone' : 'removeAvailabilityZone',
            'click #add_instance_button' : 'addInstance',
            'click #manage_availability_zones_button' : 'manageAvailabilityZones'
        },

        actions: [
            { text: "Delete Load Balancer", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.$el.html(this.template);
            this.loadData({ render: true });
            
            var loadBalancerApp = this;
            Common.vent.on("loadBalancerAppRefresh", function() {
                loadBalancerApp.render();
            });
            Common.vent.on("resetDescribeHealth", function(availabilityZonesHealth, instancesHealth) {
                loadBalancerApp.addAllInstanceAndAZs(availabilityZonesHealth, instancesHealth);
            });
            Common.vent.on("instancesRefresh", function() {
                loadBalancerApp.reselectTab = true;
                loadBalancerApp.render();
            });
            Common.vent.on("listenersRefresh", function() {
                loadBalancerApp.refreshListenersTab();
            });
            this.healthyHostCountData.on( 'reset', function() {this.addMonitorGraph("#healthy_host_count", this.healthyHostCountData, ["Average"], ["Healthy Host Count"], ["#FF8000"]);}, this );
            this.unhealthyHostCountData.on( 'reset', function() {this.addMonitorGraph("#unhealthy_host_count", this.unhealthyHostCountData, ["Average"], ["Unhealthy Host Count"], ["#00CC00"]);}, this );
        },

        toggleActions: function(e) {
            //Disable any needed actions
            if(this.reselectTab) {
                this.refreshInstancesTab();
                $("#detail_tabs").tabs("select", this.selectedTabIndex);
                this.reselectTab = false;
            }
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
                                    "<span><b>Availability Zones:</b></span><button id='manage_availability_zones_button'>Manage Availability Zones</button><br /><br />" +
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
            $("#manage_availability_zones_button").button();

            var loadBalancer = this.collection.get(this.selectedId);
            loadBalancer.describeHealth(this.credentialId, this.region);
        },

        addAllInstanceAndAZs: function(availabilityZonesHealth, instancesHealth) {
            $("#instances_table").dataTable().fnClearTable();
            $.each(instancesHealth, function(index, value) {
                var aZone;
                if(value.AvailabilityZone){
                    aZone = value.AvailabilityZone;
                }else{
                    aZone = "";
                }
                var instanceHealthData = [value.InstanceId, aZone, value.State, "<a href='' class='remove_instance'>Remove from Load Balancer</a>"];
                $("#instances_table").dataTable().fnAddData(instanceHealthData);
            });
            $("#availability_zones_table").dataTable().fnClearTable();
            $.each(availabilityZonesHealth, function(index, value) {
                var azHealthData;
                if(availabilityZonesHealth.length > 1) {
                    azHealthData = [value.AvailabilityZone, value.InstanceCount, value.Healthy, "<a href='' class='remove_availability_zone'>Remove from Load Balancer</a>"];
                }else {
                    azHealthData = [value.AvailabilityZone, value.InstanceCount, value.Healthy, "-"];
                }
                $("#availability_zones_table").dataTable().fnAddData(azHealthData);
            });
        },

        addInstance: function() {
            var loadBalancer = this.collection.get(this.selectedId);
            new RegisterInstance({cred_id: this.credentialId, region: this.region, load_balancer: loadBalancer});
        },

        removeInstance: function(event) {
            var selectedRowData = $("#instances_table").dataTable().fnGetData(event.currentTarget.parentElement.parentElement);
            var instanceIds = [selectedRowData[0]];
            var loadBalancer = this.collection.get(this.selectedId);
            loadBalancer.deregisterInstances(instanceIds, this.credentialId, this.region);
            return false;
        },

        manageAvailabilityZones: function() {
            var loadBalancer = this.collection.get(this.selectedId);
            new ManageAvailabilityZones({cred_id: this.credentialId, region: this.region, load_balancer: loadBalancer});
        },

        removeAvailabilityZone: function(event) {
            var selectedRowData = $("#availability_zones_table").dataTable().fnGetData(event.currentTarget.parentElement.parentElement);
            var availabilityZones = [selectedRowData[0]];
            var loadBalancer = this.collection.get(this.selectedId);
            loadBalancer.disableAvailabilityZones(availabilityZones, this.credentialId, this.region);
            return false;
        },

        refreshListenersTab: function() {
            $("#listeners_tab_content").empty();
            $("#listeners_tab_content").append("<div>" +
                                                    "<div style='padding-bottom:10px;'>" +
                                                        "<span style='margin-right:2px;'><b>LB Protocol:</b></span>" +
                                                        "<select id='lb_protocol_select' style='width:70px;'>" +
                                                            "<option value='HTTP'>HTTP</option>" +
                                                            "<option value='HTTPS'>HTTPS</option>" +
                                                            "<option value='TCP'>TCP</option>" +
                                                            "<option value='SSL'>SSL</option>" +
                                                        "</select>" +
                                                        "<span style='margin-left:10px;margin-right:2px;'><b>LB Port:</b></span>" +
                                                        "<input id='lb_port_input' type='text' style='width:50px;margin-right:10px;'/>" +
                                                        "<span style='margin-right:2px;'><b>Instance Protocol:</b></span>" +
                                                        "<select id='instance_protocol_select' style='width:70px;'>" +
                                                            "<option value='HTTP'>HTTP</option>" +
                                                            "<option value='HTTPS'>HTTPS</option>" +
                                                            "<option value='TCP'>TCP</option>" +
                                                            "<option value='SSL'>SSL</option>" +
                                                        "</select>" +
                                                        "<span style='margin-left:10px;margin-right:2px;'><b>Instance Port:</b></span>" +
                                                        "<input id='instance_port_input' type='text' style='width:50px;margin-right:20px;'/>" +
                                                        "<button id='listener_save_button'>Save</button>" +
                                                    "</div>" +
                                                    "<table id='lb_listeners_table'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th style='width:160px;'>Load Balancer Protocol</th><th style='width:140px;'>Load Balancer Port</th><th style='width:130px;'>Instance Protocol</th><th style='width:100px;'>Instance Port</th><th>SSL Certificate</th><th>Actions</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>" +
                                                "</div>");
            $("#lb_listeners_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#listener_save_button").button();
            this.listeners = new Listeners({"load_balancer_id": this.selectedId});
            this.listeners.on( 'reset', this.addAllListeners, this );
            this.listeners.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region, load_balancer: this.selectedId}), reset: true});
        },

        addAllListeners: function() {
            $("#lb_listeners_table").dataTable().fnClearTable();
            this.listeners.each(function(listener) {
                var view = new ResourceRowView({ tableId: "#lb_listeners_table", model: listener });
                view.columns = ["protocol", "lb_port", "instance_protocol", "instance_port", "ssl_id", "removeFromLoadBalancerButton"];
                view.render();
            });
        },

        saveListener: function() {
            var lbPortInt = parseInt($("#lb_port_input").val(), 10);
            var instancePortInt = parseInt($("#instance_port_input").val(), 10);
            if(lbPortInt > 0 && instancePortInt > 0 ) {
                var listenerFound = false;
                this.listeners.each(function(listener) {
                    if(lbPortInt === listener.attributes.lb_port) {
                        listenerFound = true;
                    }
                });
                if(listenerFound) {
                    Common.errorDialog("Invalid Request", "You cannot have duplicate load balancer ports.");
                }else {
                    var loadBalancer = this.collection.get(this.selectedId);
                    var listeners = [{"Protocol": $("#lb_protocol_select").val(), "LoadBalancerPort": $("#lb_port_input").val(), "InstanceProtocol": $("#instance_protocol_select").val(), "InstancePort": $("#instance_port_input").val()}];
                    loadBalancer.createListeners(listeners, this.credentialId, this.region);
                }
            }else {
                Common.errorDialog("Invalid Request", "Invalid request for listener ports.");
            }
        },

        removeListener: function(event) {
            var selectedRowData = $("#lb_listeners_table").dataTable().fnGetData(event.currentTarget.parentElement.parentElement);
            var ports = [selectedRowData[1]];
            var loadBalancer = this.collection.get(this.selectedId);
            loadBalancer.destroyListeners(ports, this.credentialId, this.region);
            return false;
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
            $("#monitor_time_range").change(function() {
                loadBalancerApp.refreshMonitors();
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
            };
            
            metricStatisticOptions.metric_name = "HealthyHostCount";
            this.healthyHostCountData.fetch({ data: $.param(metricStatisticOptions), reset: true });
            metricStatisticOptions.metric_name = "UnHealthyHostCount";
            this.unhealthyHostCountData.fetch({ data: $.param(metricStatisticOptions), reset: true });
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
    
    return AwsLoadBalancersAppView;
});
