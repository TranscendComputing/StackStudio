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
        'text!templates/aws/iam/awsUserCreateTemplate.html',
        '/js/aws/models/iam/awsUser.js',
        'common'      
], function( $, _, Backbone, DialogView, userCreateTemplate, User, Common ) {
    
    var UserCreateView = DialogView.extend({

        template: _.template(userCreateTemplate),

        credentialId: undefined,

        user: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            var createView = this;
            Common.vent.off("userCreated");
            Common.vent.on("userCreated", function() {
                createView.finish();
            });
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create User",
                width:500,
                minHeight: 150,
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
            this.user = new User();
        },
        
        create: function() {
            var createView = this;
            var newUser = this.user;
            var options = {};
            var issue = false;

            if($("#user_name_input").val() !== "") {
                options.id = $("#user_name_input").val();
            }else {
                issue = true;
            }

            if($("#user_password_input").val() !== $("#user_password_confirm_input").val()) {
                Common.errorDialog("Bad Request", "Password fields do not match.");
                issue = true;
            }

            if(!issue) {
                newUser.create(options, this.credentialId);
            }
        },

        finish: function() {
            var newUser = this.user,
                options;
            if($("#user_password_input").val() !== "") {
                options = {id: $("#user_name_input").val(), password: $("#user_password_input").val()};
                newUser.createLoginProfile(options, this.credentialId);
            }
            if($("#generate_keys_checkbox").is(":checked")) {
                options = {"UserName": $("#user_name_input").val()};
                newUser.createAccessKey(options, this.credentialId);
            }
            Common.vent.trigger("userAppRefresh");
            this.$el.dialog('close');
        }

    });
    
    return UserCreateView;
});
