/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/cloudCredentialCreateTemplate.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'models/cloud',
        'collections/clouds',
        '/js/aws/views/account/awsCredentialFormView.js',
        'jquery.ui.selectmenu'
], function( $, _, Backbone, Common, cloudCredentialCreateTemplate, cloudCredential, cloudCredentials, cloud, clouds, AwsCredentialFormView ) {

    var CloudCredentialCreateView = Backbone.View.extend({
        tagName: "div",
        
        template: _.template(cloudCredentialCreateTemplate),
        
        credentialForm: AwsCredentialFormView,
        
        cloud: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var credCreateView = this;
            this.$el.html(this.template);
            
            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Credential",
                width:575,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        credCreateView.credentialForm.create(credCreateView.cloud);
                        credCreateView.$el.dialog('close');
                    },
                    Cancel: function() {
                        credCreateView.cancel();
                    }
                }
            });
            
            $("select").selectmenu();
            var CredForm = this.credentialForm;
            this.credentialForm = new CredForm({el: "#credential_create_form"});
            
            clouds.on( 'reset', this.setCloud, this );
            clouds.fetch();
        },

        render: function () {
        
        },
        
        setCloud: function() {
            var credCreateView = this;
            clouds.each(function(cloud) {
               if(cloud.attributes.cloud_provider.toLowerCase() === "aws") {
                   credCreateView.cloud = cloud;
               }
            });
        },
        
        changeFormView: function() {
            
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        close: function() {
            $("#credential_create_form").remove();
        }
    });

    return CloudCredentialCreateView;
});
