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
        'text!templates/aws/compute/awsElasticIPCreateTemplate.html',
        '/js/aws/models/compute/awsElasticIP.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, elasticIPCreateTemplate, ElasticIP, ich, Common ) {
    
    var AwsElasticIPCreateView = DialogView.extend({

        credentialId: undefined,
        
        elasticIp: new ElasticIP(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
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
            var newElasticIp = this.elasticIp;
            var options = {};
            //Validate and create
            if($("#eip_type_select").val() === "vpc") {
                options.domain = "vpc";
            }
            newElasticIp.create(options, this.credentialId);
            this.$el.dialog('close');
        }

    });

    console.log("aws elastic ip create view defined");
    
    return AwsElasticIPCreateView;
});
