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
            })
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
            var newUser = this.user;
            if($("#user_password_input").val() !== "") {
                var options = {id: $("#user_name_input").val(), password: $("#user_password_input").val()};
                newUser.createLoginProfile(options, this.credentialId);
            }
            if($("#generate_keys_checkbox").is(":checked")) {
                var options = {"UserName": $("#user_name_input").val()};
                newUser.createAccessKey(options, this.credentialId);
            }
            Common.vent.trigger("userAppRefresh");
            this.$el.dialog('close');
        }

    });
    
    return UserCreateView;
});
