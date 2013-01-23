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
        'text!templates/aws/compute/awsElasticIPCreateTemplate.html',
        '/js/aws/models/compute/awsElasticIP.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, elasticIPCreateTemplate, ElasticIP, ich, Common ) {
    
    var AwsElasticIPCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(elasticIPCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Associate New Address",
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
        
        close: function() {
            console.log("close initiated");
            $("#eip_type_select").remove();
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            console.log("create_initiated");
            //Validate and create
            this.$el.dialog('close');
        }

    });

    console.log("aws elastic ip create view defined");
    
    return AwsElasticIPCreateView;
});
