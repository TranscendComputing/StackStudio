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
        'text!templates/openstack/compute/openstackElasticIPCreateTemplate.html',
        '/js/openstack/models/compute/openstackElasticIP.js',
        '/js/openstack/collections/compute/openstackAddressPools.js',
        'common'
        
], function( $, _, Backbone, DialogView, elasticIPCreateTemplate, ElasticIP, AddressPools, Common ) {
    
    var OpenstackElasticIPCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        addressPools: new AddressPools(),

        model: new ElasticIP(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(elasticIPCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Allocate New Address",
                width:350,
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
            $("#eip_type_select, #address_pool_select").selectmenu();

            this.addressPools.on( 'reset', this.addAllAddressPools, this );
            this.addressPools.fetch({data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true});
        },

        addAllAddressPools: function() {
            $("#address_pool_select").empty();
            this.addressPools.each(function(addressPool) {
                $("#address_pool_select").append($("<option></option>").text(addressPool.attributes.name));
            });
            $("#address_pool_select").selectmenu();
        },
        
        create: function() {
            var newElasticIp = this.model;
            if($("#address_pool_select").val()) {
                var options = {"pool":$("#address_pool_select").val()};
            }
            newElasticIp.create(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });
    
    return OpenstackElasticIPCreateView;
});
