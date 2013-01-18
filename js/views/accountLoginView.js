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
        'text!/templates/account/accountLoginTemplate.html',
        'icanhaz',
        'common'      
], function( $, _, Backbone, Account, accountLoginTemplate, ich, Common ) {
    
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
        
        template: _.template(accountLoginTemplate),
        
        // Delegated events for creating new instances, etc.
        events: {
            "change input#username": "usernameChanged",
            "change input#password": "passwordChanged"
        },

        initialize: function() {
            //TODO
        },
        
        usernameChanged: function(e) {
            var u = this.username;
            this.model.set({username: u.val()});
            console.log(this.model);
            console.log(u.val());
        },
        
        passwordChanged: function(e) {
            var p = this.password;
            this.model.set({password: p.val()});
            console.log(this.model);
        },

        render: function() {
            var accountLoginView = this;
            
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "GitHub Login",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    "Login": function () {
                        accountLoginView.login();
                    },
                    "Cancel": function() {
                        accountLoginView.cancel();
                    }
                }
            });
            
            this.$(".accordion").accordion();
            this.username = this.$('input#username');
            this.password = this.$('input#password');
            
            if (this.loginMessage) {
                $("#login_message").append(this.loginMessage);
            }
            return this;
        },
        
        close: function() {
            console.log(this.previous_location);
            //document.location.hash = this.previous_location;
            console.log("close initiated");
            this.$el.dialog('close');
        },
        
        cancel: function() {
            //document.location.hash = this.previous_location;
            this.$el.dialog('close');
        },
        
        login: function() {
            this.model.login();
            this.close();
        }

    });
    
    Common.router.on("route:accountLogin", function() {
        var accountLoginView = new AccountLoginView({model: new Account()});
        accountLoginView.render();
        //$("#app_container").append(accountLoginView.render().el);
    }, this);
    
    return AccountLoginView;
});
