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
        'views/dialogView',
        'text!templates/account/cloudCredentialCreateTemplate.html',
        'collections/cloudAccounts',
        'collections/cloudCredentials',
        'models/cloudCredential',
        'views/account/cloudCredentialFormView',
        'common'
        
], function( $, _, Backbone, DialogView, cloudAccountCreateTemplate, CloudAccounts, CloudCredentials, CloudCredential, CloudCredentialFormView, Common ) {
    
    var CloudAccountCreateView = DialogView.extend({

        cloudCredential: new CloudCredential(),
        
        cloudAccounts: new CloudAccounts(),
        
        cloudCredentials: new CloudCredentials(),

        onCreated: undefined,

        parentView: null,
        
        events: {
            "dialogclose": "close",
            "change select#cloud_accounts_select": "selectCloudAccount"
        },

        initialize: function(options) {

            if(options) {
                this.parentView = options.rootView;
            }
            
            this.subViews = [];
            
            Common.vent.on("form:completed", this.registerNewCredential, this);
            
            var createView = this;
            var compiledTemplate = _.template(cloudAccountCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Credentials",
                resizable: false,
                width: 525,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            this.render();
            var self = this;

            if(this.parentView.afterSubAppRender) {
                //make sure other events have been bound first
                setTimeout(function () {
                    self.parentView.afterSubAppRender(self);
                }, 5);
            }
        },

        render: function() {
            this.cloudAccounts.on('reset', this.addCloudAccounts, this);
            this.cloudAccounts.fetch({
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id }), 
                reset: true
            });
            
            $(".ui-dialog-buttonpane button:contains('Create')").button("disable");
        },

        createLESS: function() {
            var newCloudCredential = this.cloudCredential;
            var options = {};
            
            if($("#cloud_credential_name").val() !== "") {
                this.displayValid(true, "#cloud_credential_name");
                options.name = $("#cloud_credential_name").val();
                options.cloud_account = this.cloudAccounts.get($("#cloud_accounts_select").val());
                
                newCloudCredential.attributes.name = options.name;
                newCloudCredential.attributes.cloud_provider = options.cloud_account.attributes.cloud_provider;
                
                this.cloudCredentials.create(newCloudCredential, {cloud_account_id: options.cloud_account.id});
                
                this.$el.dialog('close');
                
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
                this.displayValid(false, "#cloud_credential_name");
            }
        },
        
        create: function(){
            if(this.selectedCloudCredential.id === ""){
                this.cloudCredentials.create(this.selectedCloudCredential, {cloud_account_id: this.selectedCloudAccount.id});
                this.$el.dialog('close');
                if(this.onCreated) {
                    this.onCreated();
                }
            }
        },
        
        selectCloudAccount: function(event) {
            var accountName = $(event.target).val();
            
            if(accountName !== "All")
            {
                this.selectedCloudAccount = this.cloudAccounts.get(accountName);
                
                this.selectedCloudCredential = new CloudCredential({cloud_provider: this.selectedCloudAccount.attributes.cloud_provider});
            
                this.renderCredentialForm();
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
        
        registerNewCredential: function() {
            $(".ui-dialog-buttonpane button:contains('Create')").button("enable");
        },
        
        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        addCloudAccounts: function(){
            $("#cloud_accounts_select").empty();
            $("#cloud_accounts_select").append("<option value='All'>Select Cloud Account</option>");
            this.cloudAccounts.each(function(cloud) {
                $("#cloud_accounts_select").append("<option value="+cloud.attributes.id+">"+cloud.attributes.name+"</option>");
            });
        }
    });
    
    return CloudAccountCreateView;
});
