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
        'text!templates/account/homeTemplate.html',
        'views/account/newLoginView',
        'models/account',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, usersManagementTemplate, NewLoginView, Account) {

    var UserManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(usersManagementTemplate),

        events: {
            "click #updateUserB":"updateUser"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            
            this.account = new Account();
            var x = this;
            Common.vent.on("accountUpdate", function(data) {
                x.render();
                x.populateForm(data.account);
            });
            this.account.getUser();
            this.render();
        },

        render: function () {
            //this.displayPasswordRules();
            var userUpdateView = this;
            $("#username_label").html(sessionStorage.login);
        },
         populateFormHelper: function(p,form){
            for (var key in p) {
              if (p.hasOwnProperty(key)) {
                var typ = $( form + " input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
                          $( form + " input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else if(typ === "radio"){
                    $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key).val(p[key]);
                }
              }
            }
            if(p.permissions.length > 0){
                if(p.permissions[0].permission.name === "admin"){
                    $("#admin_checkbox").attr('checked', true);
                }
            }
            else{
                $("#admin_checkbox").removeAttr('checked');
            }
        },
        populateForm: function(model){
            this.populateFormHelper(model,"#user_form");
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
        
        updateUser: function(){
            var issue = false;

            if($("#email").val() === "") {
                issue = true;
            }

            if($("#password_input").val() !== $("#confirm_password_input").val()) {
                issue = true;
            }

            if(!issue) {
                var accountUpdate = {
                    "account":{
                        "first_name": $("#first_name").val(),
                        "last_name": $("#last_name").val(),
                        "rss_url": $("#rss_url").val(),
                        "email": $("#email").val()
                    },
                    "permissions":{
                        "admin_login": sessionStorage.login
                    }

                };
                if($("#password_input").val() !== "" ){
                    accountUpdate.account.password = $("#password_input").val();
                    accountUpdate.account.password_confirmation = $("#confirm_password_input").val();
                }
                this.account.setUser(accountUpdate);
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields and passwords must match.");
            }
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return UserManagementView;
});
