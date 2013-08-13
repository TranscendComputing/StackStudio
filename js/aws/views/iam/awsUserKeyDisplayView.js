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
        'views/dialogView',
        'text!templates/aws/iam/awsUserKeyDisplayTemplate.html',
        'common'      
], function( $, _, Backbone, DialogView, userKeyDisplayTemplate, Common ) {
    
    var UserKeyDisplayView = DialogView.extend({

        template: _.template(userKeyDisplayTemplate),

        credentialDisplayToggle: undefined,
        
        events: {
            "dialogclose": "close",
            "click #display_credential_toggle": "toggleCredentialDisplay"
        },

        initialize: function(options) {
            var view = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "User Keys",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Close: function () {
                        view.close();
                    }
                }
            });
            $("#user_name_display").html(options.UserName);
            $("#access_key_display").html(options.AccessKeyId);
            $("#secret_access_key_display").html(options.SecretAccessKey);
            this.credentialDisplayToggle = true;
            this.toggleCredentialDisplay();
        },

        render: function() {
            
        },

        toggleCredentialDisplay: function() {
            if(this.credentialDisplayToggle) {
                $("#display_credential_toggle").html("Show User Credentials");
                $("#user_credentials_display").hide();
                this.credentialDisplayToggle = false;
            }else {
                $("#display_credential_toggle").html("Hide User Credentials");
                $("#user_credentials_display").show();
                this.credentialDisplayToggle = true;
            }
            return false;
        }

    });
    
    return UserKeyDisplayView;
});
