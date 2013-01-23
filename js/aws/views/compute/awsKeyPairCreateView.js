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
        'text!templates/aws/compute/awsKeyPairCreateTemplate.html',
        '/js/aws/models/compute/awsKeyPair.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, keyPairCreateTemplate, Keypair, ich, Common ) {
    
    var AwsKeyPairCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(keyPairCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Key Pair",
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
        },

        render: function() {
            
        },
        
        close: function() {
            console.log("close initiated");
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

    console.log("aws key pair create view defined");
    
    return AwsKeyPairCreateView;
});
