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
        'views/dialogView',
        'text!templates/aws/compute/awsKeyPairCreateTemplate.html',
        '/js/aws/models/compute/awsKeyPair.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, keyPairCreateTemplate, KeyPair, ich, Common ) {
    
    var AwsKeyPairCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        keyPair: new KeyPair(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
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
        
        create: function() {
            var newKeyPair = this.keyPair;
            var options = {};
            var issue = false;
            
            if($("#keypair_name").val() !== "") {
                options.name = $("#keypair_name").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                $("#keypair_form").attr("action", Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/key_pairs/create");
                $("#credential_id").attr("value", this.credentialId);
                $("#region_id").attr("value", this.region);
                $("#keypair_form").submit();
                Common.vent.trigger("keyPairAppDelayRefresh");
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            } 
        }

    });
    
    return AwsKeyPairCreateView;
});
