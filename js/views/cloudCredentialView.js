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
], function( $, _, Backbone, Common, cloudCredentialTemplate, cloudCredential, CloudCredentials, CloudCredentialCreateView ) {

    var CloudCredentialView = Backbone.View.extend({
        el: "#main",
        
        template: _.template(cloudCredentialTemplate),
        
        selectedCredential: undefined,
        
        formView: undefined,
        
        cloudCredentials: undefined,
        
        events: {
            "click #credential_list li": "selectCredential",
            "click #new_credential": "newCredential",
            "click #save_credential": "saveCredential",
            "click #delete_credential": "deleteCredential"
        },

        initialize: function() {
            
        },

        render: function () {
            this.$el.html(this.template);
            this.cloudCredentials = new CloudCredentials();
            $("button").button();
            this.cloudCredentials.on( 'reset', this.addAll, this );
            this.clearForm();
            this.cloudCredentials.fetch();
        },
        
        addOne: function( model ) {
            var logo = "";
            if(model.get("cloud_provider") === "AWS") {
                logo = "<img src='images/CloudLogos/amazon.png' />";
            }
            $("#credential_list").append("<li>" + logo + model.get("name") + "</li>");
        },
        
        addAll: function() {
            $("#credential_list").empty();
            this.cloudCredentials.each(this.addOne, this);
        },
        
        selectCredential: function( click ) {
            var credentialView = this;
            this.clearSelection();
            $(click.target).addClass("selected_item");
            
            this.cloudCredentials.each(function(cloudCred) {
                if($(click.target).text() === cloudCred.attributes.name) {
                    credentialView.selectedCredential = cloudCred;
                    var cloudProvider = cloudCred.attributes.cloud_provider.toLowerCase();
                    var formViewPath = "../"+cloudProvider+"/views/account/"+cloudProvider+"CredentialFormView";
                    require([formViewPath], function (FormView) {
                        var formView = new FormView({el: "#credential_form", credential: cloudCred});
                        credentialView.formView = formView;
                    });
                }
            });
        },
        
        clearSelection: function() {
            $("#credential_list li").each(function() {
               $(this).removeClass("selected_item");
            });
        },
        
        clearForm: function() {
            $("#credential_form").html("");
        },
        
        newCredential: function() {
            new CloudCredentialCreateView();
        },
        
        saveCredential: function() {
            if(this.selectedCredential) {
                this.formView.update(this.selectedCredential);
            }
        },
        
        deleteCredential: function() {
            if(this.selectedCredential) {
                this.cloudCredentials.deleteCredential(this.selectedCredential.attributes.id); 
            }  
        }
    });

    var cloudCredentialView;
    
    Common.router.on("route:cloudCredentials", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        console.log("cloud credentials view: cloudCredentials route");
        Common.router.navigate("#account/cloudcredentials", {trigger: true});
        cloudCredentialView.render();
    }, this);
    
    /**
    Common.vent.on("cloudCredentialCreated", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        cloudCredentialView.render();
    }, this);
    
    Common.vent.on("cloudCredentialUpdated", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        cloudCredentialView.render();
    }, this);
    
    Common.vent.on("cloudCredentialDeleted", function () {
        if (!cloudCredentialView) {
            cloudCredentialView = new CloudCredentialView();
        }
        cloudCredentialView.render();
    }, this);
    **/

    return CloudCredentialView;
});
