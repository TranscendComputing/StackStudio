/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/aws/compute/awsKeyPairCreateTemplate.html',
        '/js/aws/models/compute/awsKeyPair.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, keyPairCreateTemplate, KeyPair, ich, Common ) {
    
    var AwsKeyPairCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        credentialId: undefined,
        
        keyPair: new KeyPair(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
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
            this.$el.remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            var newKeyPair = this.keyPair;
            var options = {};
            var alert = false;
            
            if($("#keypair_name").val() !== "") {
                options.name = $("#keypair_name").val();
            }else {
                alert = true;
            }
            
            if(!alert) {
                $("#keypair_form").attr("action", Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/key_pairs/create");
                $("#credential_id").attr("value", this.credentialId);
                $("#keypair_form").submit();
                Common.vent.trigger("keyPairAppDelayRefresh");
                this.$el.dialog('close');
            }else {
                alert("Please supply the required fields.");
            } 
        }

    });

    console.log("aws key pair create view defined");
    
    return AwsKeyPairCreateView;
});
