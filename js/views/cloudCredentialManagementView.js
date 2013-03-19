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
        'icanhaz',
        'text!templates/account/managementCloudCredentialsTemplate.html',
        'models/cloudCredential',
        'collections/cloudAccounts',
        'collections/cloudCredentials',        
        'views/cloudCredentialFormView',
        'views/notificationDialogView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, managementCloudCredentialTemplate, CloudCredential, CloudAccounts, CloudCredentials, CloudCredentialFormView, NotificationDialogView ) {

    var CloudCredentialManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#submanagement_app",
        /** @type {Collection} Database collection of cloud accounts */
        cloudCredentials: new CloudCredentials(),
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementCloudCredentialTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click .list_item": "selectCloudCredential",
            "click button#new_credential": "newCredential",
            "click button#save_credential": "saveCredential",
            "click button#delete_credential": "deleteCredential",
            "change select#cloud_accounts_select": "selectCloudAccount"
        },
        /** Constructor method for current view */
        initialize: function() {
            this.subViews = [];
            //Render my own view
            this.render();
            //Add listener for form completion to enable buttons
            Common.vent.on("form:completed", this.registerNewCredential, this);
            Common.vent.on("cloudCredentialSaved", this.notifyCreated, this);
            Common.vent.on("cloudCredentialDeleted", this.notifyDeleted, this);
            //Add listeners and fetch db for credentials collection
            this.cloudCredentials.on( 'add', this.addOne, this );
            this.cloudCredentials.on( 'reset', this.addAll, this );
            this.cloudCredentials.on( 'remove', this.addAll, this );
            this.cloudCredentials.fetch();
            //Add listeners and fetch db for cloud accounts collection
            this.cloudAccounts = new CloudAccounts();
            this.cloudAccounts.on( 'add', this.addCloudAccount, this);
            this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this);
            this.cloudAccounts.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id })
            });
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            this.$el.html(this.template);
            $("div#detail_tabs").tabs();
            $("button").button({
                disabled: true
            });
            $("button#save_credential").hide();
        },

        renderCredentialForm: function() {
            if(this.subViews.length !== 0)
            {
                this.subViews[0].close();
            }
            this.credentialForm = new CloudCredentialFormView({model: this.selectedCloudCredential});
            $('button').button();
            $("button#save_credential").show();
            this.subViews.push(this.credentialForm);
        },

        addOne: function(model) {
            console.log("CloudCred: " + model.attributes.name);
            $("#credential_list").prepend("<li class='list_item' id='"+model.attributes.name+"'>"+model.attributes.name+"</li>");
            this.selectedCloudCredential = model;
        },

        addAll: function() {
            $("#credential_list").empty();            
            this.cloudCredentials.each(this.addOne, this);
        },

        filterCredentialsOnAccount: function(account) {
            $("#credential_list").empty();
            var filteredCreds = this.cloudCredentials.where({cloud_account_id: account.id});
            _.each(filteredCreds, this.addOne, this);
        },

        addCloudAccount: function(model) {
            $("select#cloud_accounts_select").append("<option value='"+model.attributes.name+"'>"+model.attributes.name+"</option>");
            this.selectedCloudAccount = model;
        },

        addAllCloudAccounts: function() {
            $("select#cloud_accounts_select").empty();  
            $("select#cloud_accounts_select").append("<option value='All'>All</option>");          
            this.cloudAccounts.each(this.addCloudAccount, this);
        },

        selectCloudAccount: function(event) {
            var accountName = event.target.selectedOptions[0].value;
            if(accountName !== "All")
            {
                $("button#new_credential").button("option", "disabled", false);
                this.selectedCloudAccount = this.cloudAccounts.where({name: accountName})[0];
                this.filterCredentialsOnAccount(this.selectedCloudAccount);
            }else{
                this.addAll();
                $("button#new_credential").button("option", "disabled", true);
            }
        },

        selectCloudCredential: function(event) {
            this.clearSelection();
            $(event.target).addClass("selected_item");
            this.selectedCloudCredential = this.cloudCredentials.where({name: event.target.id})[0];
            this.renderCredentialForm();
            $("button#delete_credential").button("option", "disabled", false);
        },

        clearSelection: function() {
            $("#credential_list li").each(function() {
               $(this).removeClass("selected_item");
            });
        },

        newCredential: function() {
            this.selectedCloudCredential = new CloudCredential({cloud_provider: this.selectedCloudAccount.attributes.cloud_provider});
            this.renderCredentialForm();
        },

        registerNewCredential: function() {
            $("button#save_credential").button("option", "disabled", false);
        },

        saveCredential: function() {
            if(this.selectedCloudCredential.id === "")
            {
                $("button.save_credential").button("option", "disabled", true);
                this.cloudCredentials.create(this.selectedCloudCredential, {cloud_account_id: this.selectedCloudAccount.id});
            }else{
                this.cloudCredentials.update(this.selectedCloudCredential);
            }
        },

        deleteCredential: function() {
            if(this.selectedCloudCredential) {
                this.cloudCredentials.deleteCredential(this.selectedCloudCredential); 
            } 
        },

        notifyCreated: function() {
            var message = "Your new cloud credentials have been successfully saved.";
            var title = "Credential Saved";
            var notifDialog = new NotificationDialogView({dialog_title: title, message: message});
        },

        notifyDeleted: function() {
            var message = "Your cloud credentials have been deleted.";
            var title = "Credential Deleted";
            var notifDialog = new NotificationDialogView({dialog_title: title, message: message});
            this.subViews[0].close();
            $("button#save_credential").hide();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.subViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        }        
    });

    return CloudCredentialManagementView;
});
