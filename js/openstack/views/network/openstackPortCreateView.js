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
        'text!templates/openstack/network/openstackPortCreateTemplate.html',
        '/js/openstack/models/network/openstackPort.js',
        '/js/openstack/collections/network/openstackPorts.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, portCreateTemplate, Port, Ports, Networks ) {

    var PortCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        collection: new Ports(),
        collectionsCount: 1, // collectionsCount tells stickit how many collections to wait for before initializing bindings
        template: portCreateTemplate,

        events: {
            "dialogclose": "close"
        },

        /**
         *    backbone.stickit bindings to map selectors to model attributes
         *    NOTE: 'this' has scope of view in selectOptions
         *    @type {Object}
         */
        bindings: {
            '#admin_state_up_checkbox': 'admin_state_up',
            '#allocation_pools_input': {
                observe: 'allocation_pools'
            },
            '#routes_input': {
                observe: 'routes'
            },
            '#name_input': 'name',
            '#mac_address_input': 'mac_address',
            'select#network_select': {
                observe: 'network_id',
                selectOptions: {
                    collection: 'this.networks',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "Select Network",
                        value: null
                    },
                    onGet: function(value, options) {
                        return value;
                    }
                }
            }
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = new Port({}, {collection: this.collection});
            this.networks = new Networks();
            this.networks.on("reset", this.applyBindings, this); // .applyBindings method defined in DialogView
            this.networks.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("port_create_template", this.template);
            this.$el.html( ich.port_create_template(this.model.toJSON()) );
            this.$el.dialog({
                autoOpen: true,
                title: "Create Port",
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
    
    return PortCreateView;
});
