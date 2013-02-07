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
        'text!templates/account/cloudCredentialTemplate.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'views/cloudCredentialCreateView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, cloudCredentialTemplate, cloudCredential, cloudCredentials, CloudCredentialCreateView ) {

    var CloudCredentialView = Backbone.View.extend({
        el: "#main",
        
        formView: undefined,
        
        template: _.template(cloudCredentialTemplate),
        
        events: {
            "click #credential_list li": "selectCredential",
            "click #new_credential": "newCredential",
            "click #save_credential": "saveCredential",
            "click #delete_credential": "deleteCredential"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("button").button();
            cloudCredentials.on( 'add', this.addOne, this );
            cloudCredentials.on( 'reset', this.addAll, this );
        },

        render: function () {            
            cloudCredentials.fetch();
        },
        
        addOne: function( model ) {
            $("#credential_list").append("<li>" + model.get("name") + "</li>");
        },
        
        addAll: function() {
            $("#credential_list").empty();
            cloudCredentials.each(this.addOne, this);
        },
        
        selectCredential: function( click ) {
            this.clearSelection();
            $(click.target).addClass("selected_li");
            
            cloudCredentials.each(function(cloudCred) {
                if($(click.target).text() === cloudCred.attributes.name) {
                    var cloudProvider = cloudCred.attributes.cloud_provider.toLowerCase();
                    var formViewPath = "../"+cloudProvider+"/account/"+cloudProvider+"CredentialFormView";
                    require([formViewPath], function (FormView) {
                        var formView = new FormView({el: "#credential_form", credential: cloudCred});
                        this.formView = formView;
                    });
                }
            });
        },
        
        clearSelection: function() {
            $("#credential_list li").each(function() {
               $(this).removeClass("selected_li") 
            });
        },
        
        newCredential: function() {
            new CloudCredentialCreateView();
        },
        
        saveCredential: function() {
            
        },
        
        deleteCredential: function() {
            
        }
    });

    var cloudCredentialView;
    
    Common.router.on("route:cloudCredentials", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        cloudCredentialView.render();
    }, this);
    
    Common.vent.on("cloudCredentialCreated", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        cloudCredentialView.render();
    }, this);

    return CloudCredentialView;
});
