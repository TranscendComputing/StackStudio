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
        'text!templates/account/newLoginTemplate.html',
        'collections/countries',
        'icanhaz',
        'common'      
], function( $, _, Backbone, newLoginTemplate, Countries, ich, Common ) {
    
    var NewLoginView = Backbone.View.extend({
        
        tagName: "div",
        
        template: _.template(newLoginTemplate),
        
        countries: undefined,

        events: {
            
        },

        initialize: function() {
            this.$el.html( this.template );
            var newLoginView = this;
            this.$el.dialog({
                title: "Register Login",
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
            this.countries.fetch();
            $("#country_select").selectmenu();
        },

        render: function() {
            
        },
        
        addAllCountries: function() {
            this.countries.each(function(country) {
                $("#country_select").append("<option value='"+country.attributes.code+"'>"+country.attributes.name+"</option");
            });
            $("#country_select").selectmenu();
        },
        
        register: function() {
            // Validation Process
            var problem = false;

            if($("#new_username").val() === "") {
                problem = true;
            }
            
            if($("#email_address").val() === "") {
                problem = true;
            }
            
            if($("#new_password").val() === "" || $("#confirm_password").val() === "") {
                problem = true;
            }else {
                if($("#new_password").val() !== $("#confirm_password").val()) {
                    problem = true;
                }
            }

            if(!$("#terms_checkbox").is(":checked")) {
                problem = true;
            }

            if(!problem) {
                var newLogin = {
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
                $.ajax({
                    url: Common.apiUrl + "/identity/v1/accounts",
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify(newLogin),
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        },
        
        close: function() {
            $("#country_select").remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        }

    });
    
    return NewLoginView;
});
