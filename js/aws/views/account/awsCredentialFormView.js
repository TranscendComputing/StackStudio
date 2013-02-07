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
        'common',
        'text!templates/aws/account/awsCredentialForm.html',
        'models/cloudCredential',
        'collections/cloudCredentials'
], function( $, _, Backbone, Common, awsCredentialTemplate, CloudCredential, cloudCredentials ) {
    'use strict';
    
    var awsCredentialFormView = Backbone.View.extend({
        
        template: _.template(awsCredentialTemplate),
        
        initialize: function(options) {
            this.$el.html(this.template);
            if(options) {
                if(options.el) {
                    this.$el = options.el;
                }
                if(options.credential) {
                    //fill it out
                }
            }
        },
        
        render: function() {
            
        },
        
        create: function(cloud) {
            var cloudCredential = new CloudCredential();
            cloudCredential.attributes.name = $('input#credential_name').val();
            cloudCredential.attributes.description = $('input#credential_description').val();
            cloudCredential.attributes.access_key = $('input#access_key').val();
            cloudCredential.attributes.secret_key = $('input#secret_key').val();
            cloudCredential.attributes.cloud_id = cloud.attributes.id;
            cloudCredential.attributes.cloud_name = cloud.attributes.name;
            cloudCredential.attributes.cloud_provider = cloud.attributes.cloud_provider;
            cloudCredential.attributes.cloud_attributes = {
                    "aws_access_key_id":  $('input#access_key').val(),
                    "aws_secret_access_key": $('input#secret_key').val()
            };
            
            cloudCredentials.create(cloudCredential);
        }
    });

    console.log("aws credential form view defined");
    
    return awsCredentialFormView;
});
