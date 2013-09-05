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
        'views/dialogView',
        'text!templates/aws/load_balancer/awsLoadBalancerCreateTemplate.html',
        '/js/aws/models/load_balancer/awsLoadBalancer.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/collections/vpc/awsSubnets.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'jquery.dataTables'
], function( $, _, Backbone, DialogView, loadBalancerCreateTemplate, LoadBalancer, VPCs, Subnets, AvailabilityZones, Common ) {
    
    var LoadBalancerCreateView = DialogView.extend({

        template: _.template(loadBalancerCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        loadBalancer: new LoadBalancer(),

        availabilityZones: new AvailabilityZones(),

        vpcs: new VPCs(),

        selectedVpc: undefined,

        listenersTable: undefined,

        selectedListener: undefined,
        
        events: {
            "dialogclose": "close",
            "click #listener_save_button": 'saveListener',
            "click #listeners_table tr": 'selectListener',
            "click #listener_remove_button": "removeListener"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Load Balancer",
                width:800,
                minHeight: 500,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            $("#accordion").accordion({ heightStyle: "fill" });
            $('#listeners_table').dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#listeners_table").dataTable().fnAddData(["HTTP", "80", "HTTP", "80"]);
            $("button").button();
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true});
            //#TODO VPC LB Support
            //this.vpcs.on("reset", this.addVpcOptions, this);
            //this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true});
        },

        addVpcOptions: function() {
            var createView = this;
            this.vpcs.each(function(vpc) {
                $("#lb_create_inside_select").append("<option value=" + vpc.attributes.id + ">" + vpc.attributes.id + "</option>");
            });
            $("#lb_create_inside_select").change(function() {
                createView.selectedVpc = $("#lb_create_inside_select").val();
                createView.loadVpcSubnets();
            });
        },

        loadVpcSubnets: function() {
            //#TODO
        },

        saveListener: function() {
            var lbPortInt = parseInt($("#lb_port_input").val(), 10);
            var instancePortInt = parseInt($("#instance_port_input").val(), 10);
            if(lbPortInt > 0 && instancePortInt > 0) {
                var listenersArray = $("#listeners_table").dataTable().fnGetData();
                var lbPortFound = false;
                $.each(listenersArray, function(index, value) {
                    if(value[1] === lbPortInt) {
                        lbPortFound = true;
                    }
                });
                if(lbPortFound) {
                    Common.errorDialog("Invalid Request", "You cannot have duplicate load balancer ports.");
                }else {
                    var rowData = [$("#lb_protocol_select").val(), $("#lb_port_input").val(), $("#instance_protocol_select").val(), $("#instance_port_input").val()];
                    $("#listeners_table").dataTable().fnAddData(rowData);
                    this.resetListenerInput();
                }
            }else {
                Common.errorDialog("Invalid Request", "Invalid request for listener ports.");
            }
        },

        resetListenerInput: function() {
            $("#lb_protocol_select").val($("#lb_protocol_select option:first").val());
            $("#lb_port_input").val("");
            $("#instance_protocol_select").val($("#instance_protocol_select option:first").val());
            $("#instance_port_input").val("");
        },

        selectListener: function(event) {
            $("#listeners_table tr").removeClass("row_selected");
            $(event.currentTarget).addClass("row_selected");
            this.selectedListener = event.currentTarget;
        },

        removeListener: function() {
            if(this.selectedListener) {
                $("#listeners_table").dataTable().fnDeleteRow($("#listeners_table .row_selected")[0]);
                this.selectedListener = undefined;
            }
        },

        create: function() {
            var createView = this;
            var newLoadBalancer = this.loadBalancer;
            var options = {};
            var issue = false;

            if($("#lb_name_input").val() !== "") {
                options.id = $("#lb_name_input").val();
            }else {
                issue = true;
            }
            options.availability_zones = [];
            this.availabilityZones.each(function(az) {
                options.availability_zones.push(az.attributes.zoneName);
            });
            options.listeners = [];
            var listenersArray = $("#listeners_table").dataTable().fnGetData();
            $.each(listenersArray, function(index, value) {
                options.listeners.push({"Protocol": value[0], "LoadBalancerPort": value[1], "InstanceProtocol": value[2], "InstancePort": value[3]});
            });

            var healthCheckOptions = {};
            healthCheckOptions.Target = $("#health_check_protocol_select").val() + ":" + $("#health_check_port_input").val() + $("#health_check_path_input").val();
            healthCheckOptions.Interval = $("#health_check_interval_input").val();
            healthCheckOptions.Timeout = $("#health_check_timeout_input").val();
            healthCheckOptions.HealthyThreshold = $("#healthy_threshold_select").val();
            healthCheckOptions.UnhealthyThreshold = $("#unhealthy_threshold_select").val();

            if(!issue) {
                newLoadBalancer.attributes.id = options.id;
                newLoadBalancer.create(options, healthCheckOptions, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
            
        }

    });
    
    return LoadBalancerCreateView;
});
