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
        'text!templates/aws/compute/awsElasticIPAssociateTemplate.html',
        '/js/aws/collections/compute/awsInstances.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, elasticIPAssociateTemplate, Instances, ich, Common ) {
    
    var AwsElasticIPCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        credentialId: undefined,
        
        instances: new Instances(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
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
            $("#associate_message").text("Select the instance you wish to associate this IP address (" + this.elasticIp.attributes.public_ip + ").");
            $("#instance_select").selectmenu();
            
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ data: $.param({ cred_id: this.credentialId}) });
        },

        render: function() {
            
        },
        
        addAllInstances: function() { 
            $("#instance_select").empty();
            this.instances.each(function(instance) {
                $("#instance_select").append($("<option></option>").text(instance.attributes.id));
            });
            $("#instance_select").selectmenu();
        },
        
        close: function() {
            this.$el.remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        associate: function() {
            var elasticIp = this.elasticIp;
            var alert = false;
            //Validate and create
            if($("#instance_select").val() !== null) {
                elasticIp.attributes.server_id = $("#instance_select").val();
            }else {
                alert = true;
            }

            if(!alert) {
                elasticIp.associateAddress(this.credentialId);
                this.$el.dialog('close');
            }
        }

    });

    console.log("aws elastic ip create view defined");
    
    return AwsElasticIPCreateView;
});
