/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/account/newLoginTemplate.html',
        'collections/countries',
        'models/user',
        'common'      
], function( $, _, Backbone, DialogView, newLoginTemplate, Countries, User, Common ) {
    
    var NewLoginView = DialogView.extend({

        template: _.template(newLoginTemplate),

        orgId: undefined,
        
        countries: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.$el.html( this.template );
            var newLoginView = this;
            this.$el.dialog({
                title: "Register User",
                autoOpen: true,
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: "Register",
                        click: function() {
                            newLoginView.register();
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            newLoginView.cancel();
                        }
                    }
                ]
            });
            this.countries = new Countries();
            this.countries.on( 'reset', this.addAllCountries, this );
            this.countries.fetch({reset: true});
            if(options && options.org_id) {
                this.orgId = options.org_id;
                $("#changeable_content").html("<td><b>Admin:</b></td><td><input id='admin_checkbox' type='checkbox'/></td>");
            }
        },

        render: function() {
            
        },
        
        addAllCountries: function() {
            this.countries.each(function(country) {
                $("#country_select").append("<option value='"+country.attributes.code+"'>"+country.attributes.name+"</option");
            });
        },
        
        register: function() {
            // Validation Process
            var issue = false;

            if($("#new_username").val() === "") {
                issue = true;
            }
            
            if($("#email_address").val() === "") {
                issue = true;
            }
            
            if($("#new_password").val() === "" || $("#confirm_password").val() === "") {
                issue = true;
            }else {
                if($("#new_password").val() !== $("#confirm_password").val()) {
                    issue = true;
                }
            }

            if(!$("#terms_checkbox").is(":checked")) {
                issue = true;
            }

            if(!issue) {
                var newLogin;
                if(this.orgId) {
                    newLogin = {
                        "account": {
                            "login": $("#new_username").val(),
                            "first_name": $("#first_name").val(),
                            "last_name": $("#last_name").val(),
                            "org_id": this.orgId,
                            "terms_of_service": $("#terms_checkbox").is(":checked"),
                            "email": $("#email_address").val(),
                            "password": $("#new_password").val(),
                            "password_confirmation": $("#confirm_password").val(),
                            "country_code": $("#country_select").val()
                        }
                    };
                }else {
                   newLogin = {
                        "account": {
                            "login": $("#new_username").val(),
                            "first_name": $("#first_name").val(),
                            "last_name": $("#last_name").val(),
                            "company": $("#company").val(),
                            "terms_of_service": $("#terms_checkbox").is(":checked"),
                            "email": $("#email_address").val(),
                            "password": $("#new_password").val(),
                            "password_confirmation": $("#confirm_password").val(),
                            "country_code": $("#country_select").val()
                        }
                    }; 
                }
                var newLoginView = this;
                $.ajax({
                    url: Common.apiUrl + "/identity/v1/accounts",
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify(newLogin),
                    success: function(data) {
                        newLoginView.finishUp(data.account.id);
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        },

        finishUp: function(newAccountId) {
            var newUser = new User();
            newUser.attributes.id = newAccountId;
            if(this.orgId) {
                if($("#admin_checkbox").is(":checked")) {
                    newUser.addPermission("admin", "transcend");
                }
            }else {
                newUser.addPermission("admin", "transcend");
            }
            
            Common.vent.trigger("userRefresh");
            this.$el.dialog('close');
        }
    });
    
    return NewLoginView;
});
