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
        '/js/openstack/collections/compute/openstackElasticIPs.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, elasticIPCreateTemplate, ElasticIPs, ich, Common ) {
    
    var OpenstackElasticIPCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        collection: new ElasticIPs(),
        
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
            $("#eip_type_select").selectmenu();
        },

        render: function() {
            
        },
        
        create: function() {
            var newElasticIp = this.collection.create();
            newElasticIp.create(this.credentialId, this.region);
            this.$el.dialog('close');
        }

    });

    console.log("openstack elastic ip create view defined");
    
    return OpenstackElasticIPCreateView;
});
