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
        'models/account',
        'text!templates/account/stackplaceLoginTemplate.html',
        'text!templates/account/stackstudioLoginTemplate.html',
        'icanhaz',
        'common'      
], function( $, _, Backbone, Account, stackplaceLoginTemplate, stackstudioLoginTemplate, ich, Common ) {
    
    /**
     * AccountLoginView is UI wizard to create cloud instances.
     *
     * @name AccountLoginView
     * @constructor
     * @category Instance
     * @param {Object} initialization object.
     * @returns {Object} Returns a InstanceCreateWizardView instance.
     */
    
    var AccountLoginView = Backbone.View.extend({
        
        tagName: "div",
        
        // Delegated events for creating new instances, etc.
        events: {
            // TODO
        },

        initialize: function() {
            Common.vent.on("account:login", this.close, this);
        },

        render: function() {
            var accountLoginView = this,
                title, template;
            
            if (window.app === "stackplace") {
                title = "GitHub Login";
                template = _.template( stackplaceLoginTemplate );
            } else {
                title = "Login";
                template = _.template( stackstudioLoginTemplate );
            }
            
            this.$el.html( template );

            this.$el.dialog({
                title: title,
                autoOpen: true,
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: "Login",
                        click: function() {
                            accountLoginView.login();
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            accountLoginView.cancel();
                        }
                    }
                ]
            });
            
            this.$(".accordion").accordion();
            this.$el.dialog('open');

            return this;
        },
        
        close: function() {
            //document.location.hash = this.previous_location;
            this.$(".accordion").remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
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
                        var messageObject = JSON.parse(jqXHR.responseText);
                        alert(messageObject["error"]["message"]);
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
                sessionStorage.cloud_accounts = JSON.stringify(data.account.cloud_accounts);
                sessionStorage.permissions = JSON.stringify(data.account.permissions);
                sessionStorage.project_memeberships = JSON.stringify(data.account.project_memberships);
                
                console.log("session login:" + sessionStorage.login);
                Common.vent.trigger("loginSuccess");
            }else {
                alert("Sorry, your browser does not support web storage...");
            }
            this.$el.dialog('close');
        }

    });
    
    return AccountLoginView;
});
