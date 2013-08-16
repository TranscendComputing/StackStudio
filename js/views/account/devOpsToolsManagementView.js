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
        'collections/users',
        'collections/configManagers',
        'views/account/configManagerCreateView',
        'text!templates/account/managementDevOpsToolsTemplate.html',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, URI, Users, ConfigManagers, ConfigManagerCreateView,managementDevOpsToolsTemplate) {

    var DevOpsToolsManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#submanagement_app",
        cloudAccounts: undefined,
        configManagers: undefined,
        users: undefined,
        template: undefined,
        rootView: undefined,
        events: {
            "click button.save-manager-button": "saveManager",
            "click button.delete-manager-button": "deleteManager",
            "click #new_config_manager": "newConfigManager"
        },
        /** Constructor method for current view */
        initialize: function() {
            
            var thisView = this;
            this.template = _.template(managementDevOpsToolsTemplate);
            this.rootView = this.options.rootView;
            this.childViews = [];
            
            this.cloudAccounts = this.rootView.cloudAccounts;
            this.configManagers = new ConfigManagers();
            this.users = new Users();

            this.cloudAccounts.fetch({
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                reset: true
            });



            this.configManagers.fetch({
                data: $.param({org_id: sessionStorage.org_id}),
                success:function(collection, response, data){
                    thisView.renderConfigManagers();
                },
                error:function(collection,response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch configuration manager data.");
                },
                reset:true
            });
            ich.clearAll();
            ich.refresh();

            this.render();
            
            Common.vent.on("devOpsViewRefresh", function() {
                thisView.refreshManagers();
            });
        },

        render: function () {
            this.$el.html(this.template);
        },

        renderConfigManagers: function() {
            if(typeof(ich['config_managers_template']) === 'undefined'){
                ich.grabTemplates();
            }
            var chefEndpoints = ich['config_managers_template']({"managers":this.configManagers.toJSON().chef, "managerType": "Chef", "authProp":"Node Name"});
            var puppetEndpoints = ich['config_managers_template']({"managers":this.configManagers.toJSON().puppet, "managerType": "Puppet", "authProp":"Certificate"});
            $('#config_managers_page').html(chefEndpoints);
            $('#config_managers_page').append(puppetEndpoints);
            
            $('button').button();
            
            this.adminCheck();
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $(".delete-button").attr("disabled", true);
                    $(".delete-button").addClass("ui-state-disabled");
                    $(".delete-button").removeClass("ui-state-hover");
                    $(".save-button").attr("disabled", true);
                    $(".save-button").addClass("ui-state-disabled");
                    $("#new_config_manager").attr("disabled", true);
                    $("#new_config_manager").addClass("ui-state-disabled");
                }
            }});
        },
        
        newConfigManager: function(){
            this.newResourceDialog = new ConfigManagerCreateView({ configManagers: this.configManagers});
            this.newResourceDialog.render();
            
        },

        deleteManager: function(event) {
            var serviceData = $(event.currentTarget.parentElement).find("input").data();
            this.configManagers.deleteManager(serviceData);
            
            // this.refreshServices();
            
            return false;
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.childViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        },
        
        refreshManagers: function(){
            this.configManagers.fetch({
                data: $.param({ org_id: sessionStorage.org_id}),
                success: _.bind(this.renderConfigManagers, this)
            });
        }
        
    });

    return DevOpsToolsManagementView;
});
