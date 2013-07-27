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
        'views/account/cloudCredentialFormView',
        'views/notificationDialogView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, managementCloudCredentialTemplate, CloudCredential, CloudAccounts, CloudCredentials, CloudCredentialFormView, NotificationDialogView ) {

    var CloudCredentialManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        tagName: 'div',
        /** @type {Collection} Database collection of cloud accounts */
        cloudCredentials: new CloudCredentials(),
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementCloudCredentialTemplate),
        rootView: undefined,
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click button#new_credential": "newCredential",
            "click button#save_credential": "saveCredential",
            "click button#delete_credential": "deleteCredential",
            "change select#cloud_accounts_select": "selectCloudAccount"
        },
        /** Constructor method for current view */
        initialize: function() {
            this.rootView = this.options.rootView;
            this.cloudCredentials = this.rootView.cloudCredentials;
            
            this.subViews = [];
            //Render my own view
            this.render();
            //Add listener for form completion to enable buttons
            Common.vent.on("form:completed", this.registerNewCredential, this);
            Common.vent.on("cloudCredentialDeleted", this.notifyDeleted, this);
            
            //Add listeners and fetch db for credentials collection
            this.cloudCredentials.fetch({reset: true});
            //Add listeners and fetch db for cloud accounts collection
            this.cloudAccounts = new CloudAccounts();
            this.cloudAccounts.on( 'add', this.addCloudAccount, this);
            this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this);
            this.cloudAccounts.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id }),
                reset: true
            });
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            //$("div#detail_tabs").tabs();
            $("button").button({
                disabled: true
            });
            $("button#save_credential").hide();
            
            if(this.rootView.treeCloudCred){
            this.treeSelectCloudCred();
            }
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

        addCloudAccount: function(model) {
            $("select#cloud_accounts_select").append("<option value='"+model.attributes.name+"'>"+model.attributes.name+"</option>");
            this.selectedCloudAccount = model;
        },

        addAllCloudAccounts: function() {
            $("select#cloud_accounts_select").empty();  
            $("select#cloud_accounts_select").append("<option value='All'>All</option>");          
            this.cloudAccounts.each(this.addCloudAccount, this);
            $("select#cloud_accounts_select").selectmenu();
        },

        selectCloudAccount: function(event) {
            var accountName = event.target.selectedOptions[0].value;
            if(accountName !== "All")
            {
                $("button#new_credential").button("option", "disabled", false);
                this.selectedCloudAccount = this.cloudAccounts.where({name: accountName})[0];
            }else{
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
        
        treeSelectCloudCred: function() {
            this.clearSelection();
            this.selectedCloudCredential = this.rootView.cloudCredentials.get(this.rootView.treeCloudCred);
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

        notifyDeleted: function() {
            this.subViews[0].close();
            $("button#save_credential").hide();
            $("button#delete_credential").button("option", "disabled", true);
            this.cloudCredentials.fetch({reset: true});
            
        },

        close: function(){
            this.$el.remove();
        }        
    });

    return CloudCredentialManagementView;
});
