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
        'text!templates/openstack/network/openstackNetworkCreateTemplate.html',
        '/js/openstack/models/network/openstackNetwork.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, networkCreateTemplate, Network, Tenants ) {
    
    var NetworkCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(networkCreateTemplate),
        model: new Network(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.tenants = new Tenants();
            this.tenants.on("reset", this.addAllTenants, this);
            this.tenants.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Create Network",
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

        addAllTenants: function() {
            $("#tenant_select").empty();
            this.tenants.each(function(tenant) {
                $("#tenant_select").append($("<option value="+tenant.attributes.id+">"+tenant.attributes.name+"</option>"));
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
            var newNetwork = this.model;
            var options = {};
            var issue = false;
            // Validation
            if($("#network_name_input").val() !== "") {
                this.displayValid(true, "#network_name_input");
                options.name = $("#network_name_input").val();
            }else {
                this.displayValid(false, "#network_name_input");
                issue = true;
            }
            options.tenant_id = $("#tenant_select").val();
            if($("#admin_state_up_checkbox").is(":checked")) {
                options.admin_state_up = true;
            }else {
                options.admin_state_up = false;
            }
            if($("#shared_checkbox").is(":checked")) {
                options.shared = true;
            }else {
                options.shared = false;
            }

            if(!issue) {
                this.model.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        }

    });
    
    return NetworkCreateView;
});
