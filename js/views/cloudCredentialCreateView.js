/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true debugger:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'common',
        'text!templates/account/cloudCredentialCreateTemplate.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'models/cloud',
        'collections/clouds',
        '/js/aws/views/account/awsCredentialFormView.js',
        '/js/openstack/views/account/openstackCredentialFormView.js',
        'jquery.ui.selectmenu'
], function( $, _, Backbone, DialogView, Common, cloudCredentialCreateTemplate, cloudCredential, cloudCredentials, cloud, clouds, AwsCredentialFormView, OpenstackCredentialFormView ) {

    var CloudCredentialCreateView = DialogView.extend({

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
            
            $("select#provider_select").selectmenu({
                change: function(e, object){
                    credCreateView.setCloud(object.value);
                }
            });
            $("select#provider_select").selectmenu("index", 0);
            this.render();
            clouds.on( 'reset', this.setCloud, this );
            clouds.fetch();
        },

        render: function () {
            var CredForm = this.credentialForm;
            this.credentialForm = new CredForm({el: "#credential_create_form"});
        },
        
        /**
         * [setCloud description]
         * Applies the correct credentials form based on the selected cloud
         * @param {String} provider
         */
        setCloud: function(provider) {
            var credCreateView = this;
            clouds.each(function(cloud) {
               if(cloud.attributes.cloud_provider.toLowerCase() === provider) {
                   credCreateView.cloud = cloud;
                   switch(provider)
                   {
                    case "aws":
                        credCreateView.credentialForm = AwsCredentialFormView;
                        break;
                    case "openstack":
                        credCreateView.credentialForm = OpenstackCredentialFormView;
                        break;
                    default:
                        credCreateView.credentialForm = AwsCredentialFormView;
                        break;
                   }
                    credCreateView.render();
               }
            });
        }
    });

    return CloudCredentialCreateView;
});
