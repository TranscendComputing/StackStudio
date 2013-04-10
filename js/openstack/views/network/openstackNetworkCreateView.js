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
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, networkCreateTemplate, Network, Networks, Tenants ) {
    
    var NetworkCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        collection: new Networks(),
        collectionsCount: 1,
        template: networkCreateTemplate,


        events: {
            "dialogclose": "close"
        },

        /**
         *    backbone.stickit bindings to map selectors to model attributes
         *    NOTE: 'this' has scope of view in selectOptions
         *    @type {Object}
         */
        bindings: {
            '#name_input': 'name',
            '#shared_checkbox': 'shared',
            '#admin_state_up_checkbox': 'admin_state_up',
            'select#tenant_select': {
                observe: 'tenant_id',
                selectOptions: {
                    collection: 'this.tenants',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "Select Tenant (optional)",
                        value: null
                    }
                }
            }
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = new Network({}, {collection: this.collection});
            this.tenants = new Tenants();
            this.tenants.on("reset", this.applyBindings, this); // .applyBindings method defined in DialogView
            this.tenants.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("network_create_template", this.template);
            this.$el.html( ich.network_create_template(this.model.toJSON()) );
            this.$el.dialog({
                autoOpen: true,
                title: "Create Network",
                width:500,
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

            // This line adds required asterisk to all fields with class 'required'
            this.$(".required").after("<span class='required'/>");
        },

        create: function() {
            this.model.create(this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });
    
    return NetworkCreateView;
});
