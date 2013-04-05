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
        '/js/openstack/collections/network/openstackSubnets.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, subnetCreateTemplate, Subnet, Subnets, Networks ) {

    var SubnetCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        collection: new Subnets(),
        collectionsCount: 1,
        template: subnetCreateTemplate,
        events: {
            "dialogclose": "close"
        },

        /**
         *    backbone.stickit bindings to map selectors to model attributes
         *    NOTE: 'this' has scope of view in selectOptions
         *    @type {Object}
         */
        bindings: {
            '#gateway_ip_input': 'gateway_ip',
            '#allocation_pools_inptu': {
                observe: 'allocation_pools'
            },
            'select#ip_version': {
                observe: 'ip_version',
                selectOptions: {
                    collection: function() {
                        return [4, 6];
                    }
                }
            },
            '#cidr': 'cidr',
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
            this.model = new Subnet({}, {collection: this.collection});
            this.networks = new Networks();
            this.networks.on("reset", this.applyBindings, this); // .applyBindings method defined in DialogView
            this.networks.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("subnet_create_template", this.template);
            this.$el.html( ich.subnet_create_template(this.model.toJSON()) );
            this.$el.dialog({
                autoOpen: true,
                title: "Create Subnet",
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
            console.log(this.model.toJSON());
            //this.model.create(this.credentialId, this.region); 
            //this.$el.dialog('close');
        }

    });
    
    return SubnetCreateView;
});
