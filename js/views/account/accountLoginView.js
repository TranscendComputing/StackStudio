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
        'opentip',
        'views/dialogView',
        'models/account',
        'text!templates/account/stackplaceLoginTemplate.html',
        'text!templates/account/stackstudioLoginTemplate.html',
        'views/account/newLoginView'
], function( $, _, Backbone, Common, OpenTip, DialogView, Account, stackplaceLoginTemplate, stackstudioLoginTemplate, NewLoginView ) {
    
    var AccountLoginView = DialogView.extend({

        events: {
            "dialogclose": "close",
            "click #account_login_button": "login",
            "click #cancel_button": "close",
            "click #show_register_form": "createNew"
        },

        initialize : function ( options ) {
          options = options || {};
          if(options.redirect) {
            this.redirect = options.redirect;
          }
        },

        render: function() {
            var accountLoginView = this,
                title, template;
            
            var $newElement;
            if (window.app === "stackplace") {
                title = "GitHub Login";
                $newElement = $(stackplaceLoginTemplate);
            } else {
                title = "Login";
                $newElement = (stackstudioLoginTemplate);
            }

            this.setElement($newElement);

            var $activeLoginModal = $(this.$el.selector);
            if($activeLoginModal.length > 0) {
              this.setElement($activeLoginModal);
            } else {
              $('body').append(this.$el);
            }

            this.$el.modal({
                show : true,
                backdrop : true,
                keyboard : true
            });

            this.$el.keypress(function(e) {
              if(e.keyCode === $.ui.keyCode.ENTER) {
                accountLoginView.login();
              }
            });
        },
        
        login: function() {
            var accountLoginView = this;
            var username = $('input#username').val(),
                password = $('input#password').val();
            if (window.app === "stackplace") {
                this.model.githubLogin(username, password);
            } else {
                var url = Common.apiUrl + "/identity/v1/accounts/auth";
                
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: {
                        'login' : username,
                        'password' : password
                    },
                    success: function(data) {
                      accountLoginView.successfulLogin(data);
                    },
                    error: function(jqXHR) {
                      Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }
        },
        
        successfulLogin: function(data) {
          if(typeof(Storage) !== "undefined") {
            sessionStorage.account_id = data.account.id;
            sessionStorage.login = data.account.login;
            sessionStorage.first_name = data.account.first_name;
            sessionStorage.last_name = data.account.last_name;
            sessionStorage.company = data.account.company;
            sessionStorage.email = data.account.email;
            sessionStorage.org_id = data.account.org_id;
            sessionStorage.cloud_credentials = JSON.stringify(data.account.cloud_credentials);
            sessionStorage.permissions = JSON.stringify(data.account.permissions);
            sessionStorage.project_memeberships = JSON.stringify(data.account.project_memberships);
            sessionStorage.group_policies = JSON.stringify(data.account.group_policies);
            sessionStorage.num_logins = data.account.num_logins;
            sessionStorage.rss_url = data.account.rss_url;
          }

          Common.cache('account', data.account);
          
          this.close();
          
          console.log("session login:" + Common.account.login);
          Common.vent.trigger("loginSuccess");
          if(this.redirect) {
            Common.router.navigate(this.redirect, {trigger: true});
          } else {
            Common.router.navigate("#account/management/home", {trigger: true});
          }
        },
        
        createNew: function() {
          this.close();
          var registerView = new NewLoginView();
          registerView.LoginView = this;
          registerView.render();
        },

        close : function () {
          this.$el.modal('hide');
          this.$el.remove();
          $('.modal-backdrop').remove();
          $('body').removeClass('modal-open');
        }
    });
    
    return AccountLoginView;
});
