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
            "click #updateUserB":"setUser"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.render();
            
            this.account = new Account();
            var x = this;
            Common.vent.on("accountUpdate", function(data) {
                x.render();
                x.setAccountFields(data.account);
            });
            this.account.getUser();
        },

        render: function () {
            this.displayPasswordRules();
            $("#username_label").html(sessionStorage.login);
        },

        displayPasswordRules: function (){
            var password_rules = JSON.parse(sessionStorage.group_policies)[0].group_policy.org_governance;
            if(password_rules.usable_characters !== undefined)
            {
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
            $("#password_length").html(password_rules.min_password_length);
        },
        
        setAccountFields: function(account){
            if(account.rss_url !== undefined){
                $("#rss_input").val(account.rss_url);
            }
        },
        
        setUser: function(){
            this.account.setUser({"rss_url":$("#rss_input").val(),"password":$("#password_input").val()});
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return UserManagementView;
});
