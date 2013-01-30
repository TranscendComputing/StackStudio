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
        'text!/templates/account/stackplaceLoginTemplate.html',
        'text!/templates/account/stackstudioLoginTemplate.html',
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
                            accountLoginView.login();
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
            this.$el.dialog('close');
        },
        
        cancel: function() {
            //document.location.hash = this.previous_location;
            this.$el.dialog('close');
        },
        
        login: function() {
            var username = $('input#username').val(),
                password = $('input#password').val();
            if (window.app === "stackplace") {
                this.model.githubLogin(username, password);
            } else {
                var url = Common.apiUrl + "/identity/v1/accounts";
                var formValues = {
                    login: username,
                    password: password
                };
                
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    success: function(data) {
                        console.log(["Login request details: ", data]);
                    }
                });
            }
        }

    });
    
    Common.router.on("route:accountLogin", function() {
        var accountLoginView = new AccountLoginView({model: new Account()});
        console.log(accountLoginView.model);
        accountLoginView.render();
        //$("#app_container").append(accountLoginView.render().el);
    }, this);
    
    return AccountLoginView;
});
