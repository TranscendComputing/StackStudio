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
        'URIjs/URI',
        'text!templates/account/managementCloudAccountTemplate.html',
        'collections/cloudAccounts',
        'collections/users',
        'collections/configManagers',
        'views/account/cloudAccountCreateView',
        'views/account/cloudServiceCreateView',
        'models/cloudService',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, URI, managementCloudAccountTemplate, CloudAccounts, Users, ConfigManagers, CloudAccountCreate, CloudServiceCreate, CloudService ) {

    var CloudAccountManagementView = Backbone.View.extend({
        tagName: "div",
        cloudAccounts: undefined,
        users: undefined,
        template: undefined,
        rootView: undefined,

        events: {
            "click button.save-button": "saveService",
            "click button#new_cloud_service": "newCloudService",
            "click button#delete_cloud_account": "deleteCloudAccount",
            "click button.delete-button": "deleteService",
            "click button#update_auth_url_button": "updateAuthUrl",
            "click button#default_region_button": "updateRegion",
            "change input#auth_url_input": "updateAuthModel",
            "click button.save-manager" : "saveManager"
        },

        initialize: function(options) {
            this.template = _.template(managementCloudAccountTemplate);
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.users = new Users();
            this.configManagers = new ConfigManagers();
            this.rootView = options.rootView;

            var thisView = this;
            Common.vent.on("managementRefresh", function() {
                thisView.render();
            });
            Common.vent.on("servicesRefresh", function() {
                thisView.render();
            });
            Common.vent.on("cloudAccountUpdated", function() {
                thisView.render();
            });

            this.render();
        },

        render: function () {
            var thisView = this;
            this.configManagers.fetch({
                data: $.param({org_id: sessionStorage.org_id}),
                success:function(collection, response, options){
                    thisView.populateConfigMenus();
                }
            });

            if(this.selectedCloudAccount) {
                this.renderAccountAttributes();
            }
        },

        renderAccountAttributes: function() {
            if(typeof(ich['cloud_service']) === 'undefined'){
                ich.grabTemplates();
            }
            
            var services = ich['cloud_service'](this.selectedCloudAccount.attributes);
            $('#services_page').html(services);
            
            $('button').button();
            
            this.adminCheck();
        },
        
        updateAuthUrl: function(){
            this.selectedCloudAccount.attributes.url = $("#auth_url_input").val();
            this.selectedCloudAccount.update();
            
            $("#update_auth_url_button").attr("disabled", true);
            $("#update_auth_url_button").addClass("ui-state-disabled");
            $("#update_auth_url_button").removeClass("ui-state-hover");
            
        },
        
        updateRegion: function(){
            this.selectedCloudAccount.attributes.default_region = $("#default_region_input").val();
            this.selectedCloudAccount.update();
            
            $("#default_region_button").attr("disabled", true);
            $("#default_region_button").addClass("ui-state-disabled");
            $("#default_region_button").removeClass("ui-state-hover");
        },
        
        updateAuthModel: function(){
            $("#update_auth_url_button").attr("disabled", false);
            $("#update_auth_url_button").removeClass("ui-state-disabled");
        },
        
        adminCheck: function(){
            var thisView = this;
            thisView.users.fetch({success: function(){
                var isAdmin = false;
                if(thisView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = thisView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $(".delete-button").attr("disabled", true);
                    $(".delete-button").addClass("ui-state-disabled");
                    $(".delete-button").removeClass("ui-state-hover");
                    $(".save-button").attr("disabled", true);
                    $(".save-button").addClass("ui-state-disabled");
                    $("#new_cloud_service").attr("disabled", true);
                    $("#new_cloud_service").addClass("ui-state-disabled");
                }
            }});
        },
        
        treeSelectCloudAccount: function() {
            this.selectedCloudAccount = this.rootView.cloudAccounts.get(this.rootView.treeCloudAccount);
            $("#services_tab").html(this.selectedCloudAccount.attributes.name);
            $("#cloud_provider_label").html(this.selectedCloudAccount.attributes.cloud_provider);
            
            if(this.selectedCloudAccount.attributes.cloud_provider === "OpenStack"){
                $("#auth_url_div").show();
                if(this.selectedCloudAccount.attributes.url){
                    $("#auth_url_input").val(this.selectedCloudAccount.attributes.url);
                }else{
                    $("#auth_url_input").val("");
                }
                $("#default_region_div").show();
                if(this.selectedCloudAccount.attributes.default_region){
                    $("#default_region_input").val(this.selectedCloudAccount.attributes.default_region);
                }else{
                    $("#default_region_input").val("");
                }
            }else{
                $("#auth_url_div").hide();
                $("#default_region_div").hide();
            }
            
            this.render();
        },

        saveService: function(event) {
            var uri, service;
            var endpointValue = $(event.currentTarget.parentElement).find("input").val();
            var inputData = $(event.currentTarget.parentElement).find("input").data();
            uri = URI.parse(endpointValue);
            service = new CloudService(uri);
            service.set({
                host: uri.hostname,
                service_type: inputData.name,
                id: inputData.id
            });
            service.unset("password");
            service.unset("username");
            this.selectedCloudAccount.updateService(service,sessionStorage.login);
            return false;
        },

        saveManager: function(event){
            var configManagerIds = [];
            $(".config-manager-select").each(function (index, value) {
                if($(value).val() !== "none") {
                    configManagerIds.push($(value).val());
                }
            });
            this.selectedCloudAccount.updateConfigManagers(configManagerIds);
        },
        
        newCloudService: function(){
            var CloudServiceCreateView = this.CloudServiceCreateView;
            
            this.newResourceDialog = new CloudServiceCreateView({ cloud_account: this.selectedCloudAccount});
            
            this.newResourceDialog.render();
            
        },

        deleteService: function(event) {
            var serviceData = $(event.currentTarget.parentElement).find("input").data();
            this.selectedCloudAccount.deleteService(serviceData, sessionStorage.login);
            
            this.refreshServices();
            
            return false;
        },
        
        deleteCloudAccount: function(){
            var cl_ac = this.selectedCloudAccount.destroy();
        },

        populateConfigMenus: function(){
            var thisView = this;
            $(".config-manager-select").empty();
            $(".config-manager-select").append("<option value='none'>None</option>");
            this.configManagers.each(function(configManager) {
                var select = $("#"+configManager.attributes.type+"_select");
                select.append("<option value="+configManager.id+">"+configManager.attributes.name+"</option>");
                if(thisView.selectedCloudAccount && configManager.attributes.cloud_account_ids.indexOf(thisView.selectedCloudAccount.id) !== -1) {
                    select.val(configManager.id);
                }
            });
        },

        close: function(){
            this.$el.remove();
        }
    });

    return CloudAccountManagementView;
});
