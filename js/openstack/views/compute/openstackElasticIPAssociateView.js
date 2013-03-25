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
        'text!templates/openstack/compute/openstackElasticIPAssociateTemplate.html',
        '/js/openstack/collections/compute/openstackInstances.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, elasticIPAssociateTemplate, Instances, ich, Common ) {
    
    var OpenstackElasticIPCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        instances: new Instances(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.elasticIp = options.elastic_ip;
            var associateView = this;
            var compiledTemplate = _.template(elasticIPAssociateTemplate);
            this.$el.html(compiledTemplate);
            this.$el.dialog({
                autoOpen: true,
                title: "Associate Address",
                width:350,
                resizable: false,
                modal: true,
                buttons: {
                    Associate: function () {
                        associateView.associate();
                    },
                    Cancel: function() {
                        associateView.cancel();
                    }
                }
            });
            $("#associate_message").text("Select the instance you wish to associate this IP address (" + this.elasticIp.attributes.ip + ").");
            $("#instance_select").selectmenu();
            ich.grabTemplates();
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }) });
        },

        render: function() {
            
        },
        
        addAllInstances: function() { 
            $("#instance_select").empty();
            this.instances.each(function(instance) {
                $("#instance_select").append(ich.eip_associate_template(instance.toJSON()));
            });
            $("#instance_select").selectmenu();
        },
        
        associate: function() {
            var elasticIp = this.elasticIp;
            var alert = false;
            var instance = $("#instance_select").find("option:selected").data();
            //Validate and create
            if(instance.id === undefined) {
                alert = true;
            }

            if(!alert) {
                elasticIp.associateAddress(instance.id, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        }

    });

    console.log("openstack elastic ip create view defined");
    
    return OpenstackElasticIPCreateView;
});
