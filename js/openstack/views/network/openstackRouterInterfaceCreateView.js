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
        'text!templates/openstack/network/openstackRouterInterfaceCreateTemplate.html',
        'openstack/models/network/openstackRouter',
        'openstack/collections/network/openstackSubnets',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, routerInterfaceCreateTemplate, Router, Subnets ) {

    var RouterInterfaceCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(routerInterfaceCreateTemplate),
        model: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = options.router;
            this.subnets = new Subnets();
            this.subnets.on("reset", this.addAllSubnets, this);
            this.subnets.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Add Router Interface",
                width: 450,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.addInterface();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
        },

        addAllSubnets: function() {
            $("#subnet_select").empty();
            this.subnets.each(function(subnet) {
                $("#subnet_select").append($("<option value="+subnet.attributes.id+">"+subnet.attributes.name+"</option>"));
            });
        },

        addInterface: function() {
            var options = {};
            var issue = false;

            options.subnet_id = $("#subnet_select").val();
            if(!issue) {
                this.model.addInterface(options, this.credentialId, this.region); 
                this.$el.dialog('close');
            }
        }

    });
    
    return RouterInterfaceCreateView;
});
