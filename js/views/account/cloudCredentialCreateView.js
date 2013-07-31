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
        '/js/collections/cloudAccounts.js',
        '/js/collections/cloudCredentials.js',
        '/js/models/cloudCredential.js',
        'common'
        
], function( $, _, Backbone, DialogView, cloudAccountCreateTemplate, CloudAccounts, CloudCredentials, CloudCredential, Common ) {
    
    var CloudAccountCreateView = DialogView.extend({

        cloudCredential: new CloudCredential(),
        
        cloudAccounts: new CloudAccounts(),
        
        cloudCredentials: new CloudCredentials(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            
            var createView = this;
            var compiledTemplate = _.template(cloudAccountCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Credentials",
                resizable: false,
                width: 350,
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
        },

        render: function() {
            this.cloudAccounts.on('reset', this.addCloudAccounts, this);
            this.cloudAccounts.fetch({
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id }), 
                reset: true
            });
        },

        create: function() {
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
        
        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        addCloudAccounts: function(){
            $("#cloud_accounts_select").empty();
            this.cloudAccounts.each(function(cloud) {
                $("#cloud_accounts_select").append("<option value="+cloud.attributes.id+">"+cloud.attributes.name+"</option>");
            });
            $("#cloud_accounts_select").selectmenu();
        }
    });
    
    return CloudAccountCreateView;
});
