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
        'common',
        'icanhaz',
        'views/dialogView',
        'text!templates/openstack/network/openstackSubnetCreateTemplate.html',
        '/js/openstack/models/network/openstackSubnet.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, subnetCreateTemplate, Subnet, Networks ) {

    var SubnetCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(subnetCreateTemplate),
        model: new Subnet(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.networks = new Networks();
            this.networks.on("reset", this.addAllNetworks, this);
            this.networks.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Create Subnet",
                width: 400,
                minHeight: 150,
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
        },

        addAllNetworks: function() {
            $("#network_select").empty();
            this.networks.each(function(network) {
                $("#network_select").append($("<option value="+network.attributes.id+">"+network.attributes.name+"</option>"));
            });
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        create: function() {
            var newSubnet = this.model;
            var options = {};
            var issue = false;

            options.network_id = $("#network_select").val();
            if($("#cidr_input").val() !== "") {
                this.displayValid(true, "#cidr_input");
                options.cidr = $("#cidr_input").val();
            }else {
                this.displayValid(false, "#cidr_input");
                issue = true;
            }
            if($("#subnet_name_input").val() !== "") {
                options.name = $("#subnet_name_input").val();
            }
            options.ip_version = $("#ip_version_select").val();
            if($("#gateway_ip_input").val() !== "") {
                options.gateway_ip = $("#gateway_ip_input").val();
            }
            if($("#allocation_pools_input").val() !== "") {
                options.allocation_pools = $("#allocation_pools").val();
            }

            if(!issue) {
                this.model.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        }

    });
    
    return SubnetCreateView;
});
