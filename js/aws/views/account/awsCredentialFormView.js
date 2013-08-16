/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
], function( $, _, Backbone, Common, awsCredentialTemplate, CloudCredential, CloudCredentials ) {
    'use strict';
    
    var awsCredentialFormView = Backbone.View.extend({
        
        template: _.template(awsCredentialTemplate),
        
        cloudCredentials: undefined,
        
        initialize: function(options) {
            this.$el.html(this.template);
            this.cloudCredentials = new CloudCredentials();
            if(options) {
                if(options.el) {
                    this.$el = options.el;
                }
                if(options.credential) {
                    $("#credential_name").val(options.credential.attributes.name);
                    $("#credential_description").text(options.credential.attributes.description);
                    $("#access_key").val(options.credential.attributes.access_key);
                    $("#secret_key").val(options.credential.attributes.secret_key);
                }
            }
        },
        
        render: function() {
            
        },
        
        create: function(cloud) {
            var cloudCredential = new CloudCredential();
            cloudCredential.attributes.name = $('#credential_create_form #credential_name').val();
            cloudCredential.attributes.description = $('#credential_create_form #credential_description').val();
            cloudCredential.attributes.access_key = $('#credential_create_form #access_key').val();
            cloudCredential.attributes.secret_key = $('#credential_create_form #secret_key').val();
            cloudCredential.attributes.cloud_id = cloud.attributes.id;
            cloudCredential.attributes.cloud_name = cloud.attributes.name;
            cloudCredential.attributes.cloud_provider = cloud.attributes.cloud_provider;
            cloudCredential.attributes.cloud_attributes = {
                    "aws_access_key_id":  $('#credential_create_form #access_key').val(),
                    "aws_secret_access_key": $('#credential_create_form #secret_key').val()
            };
            
            this.cloudCredentials.create(cloudCredential);
        },
        
        update: function(credential) {
            var updateCred = credential;
            updateCred.attributes.name = $("#credential_form #credential_name").val();
            updateCred.attributes.description = $("#credential_form #credential_description").val();
            updateCred.attributes.access_key = $("#credential_form #access_key").val();
            updateCred.attributes.secret_key = $("#credential_form #secret_key").val();
            this.cloudCredentials.update(updateCred);
        }
    });

    console.log("aws credential form view defined");
    
    return awsCredentialFormView;
});
