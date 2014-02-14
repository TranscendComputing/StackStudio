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
        'text!templates/account/myAccountManagementTemplate.html',
        'models/account',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, myAccountManagementTemplate, Account) {

    var MyAccountManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(myAccountManagementTemplate),

        events: {
            "click #updateUserB":"updateUser",
            "click #change_password_input": "clickChangePassword"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            
            this.account = new Account();
            var x = this;
            Common.vent.on("accountUpdate", function(data) {
                x.render();
            });
            this.account.getUser();
            this.render();
        },

        render: function () {
            this.displayPasswordRules();
            this.populateForm();
            this.disableInput(".password", true);
            this.update_password = false;
        },

        populateForm: function(){
            $("#username_label").html(sessionStorage.login);
            $("#email_input").val(sessionStorage.email);
        },

        displayPasswordRules: function (){
            var password_rules = [];
            if(JSON.parse(sessionStorage.group_policies)[0] !== undefined && JSON.parse(sessionStorage.permissions).length < 1)
            {
                password_rules = JSON.parse(sessionStorage.group_policies)[0].group_policy.org_governance;
                if(password_rules.usable_characters !== undefined){
                    if(password_rules.usable_characters.length === 2){
                        $.each(password_rules.usable_characters, function(index,value){
                            if(value === "Digit"){
                                $("#password_policy_digit").show();
                            }
                            else if(value === "Special"){
                                $("#password_policy_special").show();
                            }
                            else{
                                $("#password_policy_digit").hide();
                                $("#password_policy_special").hide();
                            }
                        });
                    }
                    else if(password_rules.usable_characters === "Digit"){
                        $("#password_policy_digit").show();
                    }
                    else if(password_rules.usable_characters === "Special"){
                        $("#password_policy_special").show();
                    }
                    else{
                        $("#password_policy_digit").hide();
                        $("#password_policy_special").hide();
                    }
                }
                $("#password_policy_must").show();
                $("#password_policy_none").hide();
                $("#password_policy_length").show();
                $("#password_length").html(password_rules.min_password_length);
            }
            else{
                $("#password_policy_must").hide();
                $("#password_policy_length").hide();
                $("#password_policy_none").show();
            }
        },
        disableInput: function(id,toggle) {
            if(toggle) {
                $(id).attr("disabled", true);
                $(id).addClass("ui-state-disabled");
            }else {
                $(id).removeAttr("disabled");
                $(id).removeClass("ui-state-disabled");
            }
        },
        clickChangePassword: function(event){
            if($(event.target).is(":checked")){
                this.disableInput(".password",false);
                this.update_password = true;
            }else{
                this.disableInput(".password",true);
                this.update_password = false;
            }
        },
        updateUser: function(){
            var issue = false;

            if($("#email").val() === "") {
                issue = true;
            }
            if(this.update_password){
                if($("#password_input").val() === "" || $("#confirm_password_input").val() === "") {
                    issue = true;
                }else {
                    if($("#password_input").val() !== $("#password_input").val()) {
                        issue = true;
                    }
                }
            }
            if(!issue) {
                var accountUpdate = {
                    "account":{
                        "email": $("#email_input").val(),
                        "password": $("#password_input").val()
                    },
                    "permissions":{
                        "admin_login": sessionStorage.login
                    }

                };
                if(this.update_password){
                    accountUpdate.account.password = $("#password_input").val();
                    accountUpdate.account.password_confirmation = $("#confirm_password_input").val();
                }
                this.account.setUser(accountUpdate);
            }else {
                Common.errorDialog("Invalid Request", "No fields can be empty and passwords must match.");
            }
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return MyAccountManagementView;
});
