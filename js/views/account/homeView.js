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
            $("#main").html(this.el);            
            this.delegateEvents();
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
            this.displayPasswordRules();
            var userUpdateView = this;
            $("#username_label").html(Common.account.login);
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
            var show = false;
            if(Common.account.group_policies[0] !== undefined && Common.account.permissions.length < 1)
            {
                password_rules = Common.account.group_policies[0].group_policy.org_governance;
                if(password_rules.usable_characters !== undefined){

                  if(_.filter(password_rules.usable_characters, function ( character ) {
                    return character === "Digit" || character === "Special";
                  }).length > 0) {
                    if(_.contains(password_rules.usable_characters, "Digit")) {
                      show = true;
                      $('#must_contain_digit').show();
                    }
                    if(_.contains(password_rules.usable_characters, "Special")) {
                      show = true;
                      $('#must_contain_special_character').show();
                    }
                  }
                }
                
                if(password_rules.min_password_length) {
                  show = true;
                  $('#min_chars').html(password_rules.min_password_length);
                  $('#min_character_length').show();
                }
            }
            else {
              $('.password-restrictions').hide();
              $('.no-password-restrictions').show();
            }

            if(!show) {
              $('.password-restrictions').hide();
              $('.no-password-restrictions').show();
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
                        "admin_login": Common.account.login
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
