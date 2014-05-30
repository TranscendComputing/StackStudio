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
        'collections/users',
        'collections/configManagers',
        'views/account/configManagerAddEditView',
        'text!templates/account/managementDevOpsToolsTemplate.html',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, Users, ConfigManagers, ConfigManagerAddEditView, managementDevOpsToolsTemplate) {

    var DevOpsToolsManagementView = Backbone.View.extend({
        tagName: 'div',
        configManagers: undefined,
        users: undefined,
        template: undefined,
        rootView: undefined,
        events: {
            "click button.delete_manager_button": "deleteManager",
            "click button.edit_manager_button" : "editManager",
            "click #new_config_manager": "newConfigManager"
        },

        /** Constructor method for current view */
        initialize: function(options) {
            this.template = _.template(managementDevOpsToolsTemplate);
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.rootView = options.rootView;
            this.configManagers = new ConfigManagers();
            this.users = new Users();

            var cmManagementView = this;
            Common.vent.off("ConfigManagerCreated");
            Common.vent.on("ConfigManagerCreated", function() {
                cmManagementView.render();
            });
            Common.vent.off("ConfigManagerUpdated");
            Common.vent.on("ConfigManagerUpdated", function() {
                cmManagementView.render();
            });
            Common.vent.off("ConfigManagerDeleted");
            Common.vent.on("ConfigManagerDeleted", function() {
                cmManagementView.render();
            });

            this.render();
        },

        render: function () {
            var thisView = this;
            this.configManagers.fetch({
                success:function(collection, response, data){
                    thisView.renderConfigManagers();

                    if(thisView.rootView.afterSubAppRender) {
                        thisView.rootView.afterSubAppRender(thisView);
                    }
                },
                error:function(collection, response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch config manager data.");
                },
                reset: true
            });
        },

        renderConfigManagers: function() {
            if(typeof(ich['config_manager_template']) === 'undefined'){
                // This because for whatever reason, ich keeps forggeting this template
                ich.addTemplate("config_manager_template", 
                    "<div class='manager_list'>" +
                        "<fieldset>" +
                            "<legend>{{{icon}}} {{managerType}} Endpoints</legend>" +
                            "{{#managers}}" +
                            "<p>" +
                                "<label class='tabbed-field'>{{name}}:</label>" +
                                "<input data-id='{{_id}}' type='text' data-name='{{type}}'' class='textbox-400' value='{{url}}'></input>" +
                                "<button class='delete_manager_button'>Delete</button>" +
                                "<button class='edit_manager_button'>Edit</button>" +
                            "</p>" +
                            "{{/managers}}" +
                            "{{^managers}}" +
                            "<p><label>No endpoints defined.</label></p>" +
                            "{{/managers}}" +
                        "</fieldset>" +
                    "</div>");
            }
            var chefEndpoints = [];
            var puppetEndpoints = [];
            var saltEndpoints = [];
            var ansibleEndpoints = [];
            this.configManagers.each(function(cm) {
                cm = cm.attributes;
                switch(cm["type"]) {
                    case "chef":
                        chefEndpoints.push(cm);
                        break;
                    case "puppet":
                        puppetEndpoints.push(cm);
                        break;
                    case "salt":
                        saltEndpoints.push(cm);
                        break;
                    case "ansible":
                        ansibleEndpoints.push(cm);
                        break;
                }
            });
            var chefEndpointsTemplate = ich['config_manager_template']({"managers": chefEndpoints, "managerType": "Chef", "icon": Common.icons.chef});
            var puppetEndpointsTemplate = ich['config_manager_template']({"managers": puppetEndpoints, "managerType": "Puppet", "icon": Common.icons.puppet});
            var saltEndpointsTemplate = ich['config_manager_template']({"managers": saltEndpoints, "managerType": "Salt", "icon": Common.icons.salt});
            var ansibleEndpointsTemplate = ich['config_manager_template']({"managers": ansibleEndpoints, "managerType": "Ansible", "icon": Common.icons.ansible});
            $('#config_managers_page').html(chefEndpointsTemplate);
            $('#config_managers_page').append(puppetEndpointsTemplate);
            $('#config_managers_page').append(saltEndpointsTemplate);
            $('#config_managers_page').append(ansibleEndpointsTemplate);
            $('input').prop('disabled', true);
            $('button').button();
            this.adminCheck();
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(Common.account.id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(Common.account.id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $(".delete-button").attr("disabled", true);
                    $(".delete-button").addClass("ui-state-disabled");
                    $(".delete-button").removeClass("ui-state-hover");
                    $("#new_config_manager").attr("disabled", true);
                    $("#new_config_manager").addClass("ui-state-disabled");
                }
            }});
        },
        
        newConfigManager: function(){
            new ConfigManagerAddEditView({configManagers: this.configManagers, rootView : this.rootView });
        },

        editManager: function(event){
            var managerId = $(event.currentTarget).parent().find("input").data("id");
            var manager = this.configManagers.get(managerId);
            new ConfigManagerAddEditView({configManagers: this.configManagers, configManager: manager});
        },

        deleteManager: function(event) {
            var managerId = $(event.currentTarget).parent().find("input").data("id");
            var manager = this.configManagers.get(managerId);
            manager.destroy();
        },

        close: function(){
            this.$el.remove();
        }
        
    });

    return DevOpsToolsManagementView;
});
