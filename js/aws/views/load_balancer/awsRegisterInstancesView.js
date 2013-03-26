/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/load_balancer/awsRegisterInstancesTemplate.html',
        '/js/aws/collections/compute/awsInstances.js',
        'common'
        
], function( $, _, Backbone, DialogView, registerInstancesTemplate, Instances, Common ) {
    
    var RegisterInstancesView = DialogView.extend({

        template: _.template(registerInstancesTemplate),

        credentialId: undefined,

        region: undefined,

        loadBalancer: undefined,

        instances: undefined,

        selectedInstance: undefined,

        zonesDistribution: undefined,
        
        events: {
            "dialogclose": "close",
            "click #register_instance_table tr" : "selectInstance"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.loadBalancer = options.load_balancer;
            var registerView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Register Instance",
                resizable: false,
                width: 600,
                modal: true,
                buttons: {
                    Register: function () {
                        registerView.register();
                    },
                    Cancel: function() {
                        registerView.cancel();
                    }
                }
            });

            this.zonesDistribution = {};

            $('#register_instance_table').dataTable({
                "bJQueryUI": true
            });

            this.instances = new Instances();
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region })});
        },

        render: function() {
            $("#zone_distribution_content").empty();
            $.each(this.zonesDistribution, function(index, value) {
                $("#zone_distribution_content").append("<span>" + value + " instances in " + index + "</span><br />")
            });
        },
        
        addAllInstances: function() {
            var registerView = this;
            this.instances.each(function(instance) {
                var alreadyRegistered = false;
                $.each(registerView.loadBalancer.attributes.instances, function(index, value) {
                    if(value == instance.attributes.id) {
                        alreadyRegistered = true;
                    }
                });
                if(alreadyRegistered) {
                    registerView.addToZoneDistribtuion(instance);
                }else {
                    var instanceName = "";
                    if(instance.attributes.tags.Name) { instanceName = instance.attributes.tags.Name }
                    var rowData = [instance.attributes.id, instanceName, instance.attributes.availability_zone, instance.attributes.state];
                    $('#register_instance_table').dataTable().fnAddData(rowData);
                }
            });
            this.render();
        },

        addToZoneDistribtuion: function(instance) {
            if(this.zonesDistribution.hasOwnProperty(instance.attributes.availability_zone)) {
                this.zonesDistribution[instance.attributes.availability_zone]++;
            }else {
                this.zonesDistribution[instance.attributes.availability_zone]=1;
            }  
        },

        selectInstance: function(event) {
            $("#register_instance_table tr").removeClass("row_selected");
            if(this.selectedInstance) {
                this.zonesDistribution[this.selectedInstance.attributes.availability_zone]--;
                if(this.zonesDistribution[this.selectedInstance.attributes.availability_zone] == 0) {
                    delete this.zonesDistribution[this.selectedInstance.attributes.availability_zone];
                }
            }
            $(event.currentTarget).addClass("row_selected");
            var rowData = $("#register_instance_table").dataTable().fnGetData(event.currentTarget);
            this.selectedInstance = this.instances.get(rowData[0]);
            this.addToZoneDistribtuion(this.selectedInstance);
            this.render();
        },

        register: function() {
            if(this.selectedInstance) {
                this.loadBalancer.registerInstances([this.selectedInstance.attributes.id], this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please select an instance to register to the load balancer.");
            }
        }
    });
    
    return RegisterInstancesView;
});
