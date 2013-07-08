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
        'views/resource/resourceAppView',
        'collections/cloudCredentials',
        'collections/cloudAccounts',
        'common'
], function( $, _, Backbone, ResourceAppView, CloudCredentials, CloudAccounts, Common ) {
    'use strict';

    var TopStackAdminConsoleAppView = ResourceAppView.extend({

        type: "admin",
        
        subtype: "console",

        CloudAccountsType: CloudAccounts,

        cloudCredentials: undefined,

        cloudAccounts: undefined,

        selectedCloudAccount: undefined,

        adminConsoleUrl: undefined,

        failed: false,
        
        events: {
            
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }

            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.fetchCloudAccount, this );
            this.cloudCredentials.fetch({reset: true});
            this.render();
        },

        render: function() {
            if(this.failed) {
                $("#resource_app").html("");
            }else if (this.adminConsoleUrl){
                this.$el.html("<iframe id='admin_frame' src='"+this.adminConsoleUrl+"' class='full_width' height='720' style='-webkit-transform:scale(1);-moz-transform-scale(0.5);'></iframe>");
                $("#resource_app").html(this.$el);
            }
        },

        fetchCloudAccount: function() {
            var adminView = this;
            this.cloudCredentials.each(function (cloudCredential) {
                if(adminView.credentialId === cloudCredential.attributes.id) {
                    adminView.selectedCloudAccount = cloudCredential.attributes.cloud_account_id;
                }
            });

            if(this.selectedCloudAccount) {
                var CloudAccountsType = this.CloudAccountsType;
                this.cloudAccounts = new CloudAccountsType();
                this.cloudAccounts.on( 'reset', this.setCloudAccount, this );
                this.cloudAccounts.fetch({ 
                    data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                    reset: true
                });
            }else {
                Common.errorDialog("Error", "Could not find Admin Console Service.");
                this.failed = true;
                this.render();
            }
            
        },

        setCloudAccount: function() {
            var adminView = this;
            var adminConsoleService;
            this.cloudAccounts.each(function (cloudAccount) {
                if(adminView.selectedCloudAccount === cloudAccount.attributes.id) {
                    $.each(cloudAccount.attributes.cloud_services, function(index, value) {
                        if(value.cloud_service.service_type === "AdminConsole") {
                            adminConsoleService = value.cloud_service;
                        }
                    });
                }
            });

            if(adminConsoleService) {
                this.adminConsoleUrl = adminConsoleService.protocol + "://" + adminConsoleService.host + ":" + adminConsoleService.port + adminConsoleService.path;
            }else {
                Common.errorDialog("Error", "Could not find Admin Console Service.");
                this.failed = true;
            }
            this.render();
        }
    });
    
    return TopStackAdminConsoleAppView;
});
