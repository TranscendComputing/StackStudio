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
        'common',
        'views/dialogView',
        'text!templates/account/newLoginTemplate.html',
        'collections/countries',
        'models/user'
], function( $, _, Backbone, Common, DialogView, newLoginTemplate, Countries, User ) {
    
    var NewLoginView = DialogView.extend({

        orgId: undefined,
        
        countries: undefined,

        events: {
            "click #show_login_form": "login",
            "click #register_button": "register",
            "click #cancel_button": "close"
        },

        initialize: function ( options ) {
          
          this.countries = new Countries();
          this.countries.on( 'reset', this.addAllCountries, this );
          this.countries.fetch({reset: true});
          if(options && options.org_id) {
              this.orgId = options.org_id;
              $("#changeable_content").html("<td><b>Admin:</b></td><td><input id='admin_checkbox' type='checkbox'/></td>");
          }
        },

        render: function() {

          var $newElement = $(newLoginTemplate);
          this.setElement($newElement);

          $('#account_register').remove();
          $('body').append(this.$el);

          this.$el.modal({
            show: true,
            backdrop : true,
            keyboard: true
          });

          this.delegateEvents();
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

            newAccountId = newAccountId || {};

            if(newAccountId.$oid) {
                newAccountId = newAccountId.$oid;
            }

            newUser.attributes.id = newAccountId;
            if(this.orgId) {
                if($("#admin_checkbox").is(":checked")) {
                    newUser.addPermission("admin", "transcend");
                }
            }else {
                newUser.addPermission("admin", "transcend");
            }
            
            Common.vent.trigger("userRefresh");
            this.close();
        },

        login : function () {
          this.close();
          this.LoginView.render();
        },

        close : function () {
          this.$el.modal('hide');
          this.$el.remove();
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
        }
    });
    
    return NewLoginView;
});
