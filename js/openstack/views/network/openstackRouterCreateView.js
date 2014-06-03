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
        'text!templates/openstack/network/openstackRouterCreateTemplate.html',
        'openstack/models/network/openstackRouter',
        'openstack/collections/network/openstackNetworks',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, routerCreateTemplate, Router, Networks ) {

    var RouterCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(routerCreateTemplate),
        model: new Router(),

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
                title: "Create Router",
                width: 450,
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
                if(network.attributes["router:external"]){
                    $("#network_select").append($("<option value="+network.attributes.id+">"+network.attributes.name+"</option>"));
                }
            });
        },

        create: function() {
            var newRouter = this.model;
            var options = {};
            options.external_gateway_info = {};
            var issue = false;

            options.external_gateway_info.network_id = $("#network_select").val();
            if($("#name_input").val() !== "") {
                options.name = $("#name_input").val();
            }
            if($("#admin_state_up_checkbox").is(":checked")) {
                options.admin_state_up = true;
            }else {
                options.admin_state_up = false;
            }

            if(!issue) {
                this.model.create(options, this.credentialId, this.region); 
                this.$el.dialog('close');
            }
        }

    });
    
    return RouterCreateView;
});
