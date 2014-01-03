/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/platform_components/platformComponentsTemplate.html',
        'collections/configManagers'
], function( $, _, bootstrap, Backbone, Common, platformComponentsTemplate, ConfigManagers ) {

    var PlatformComponentsView = Backbone.View.extend({

        tagName: 'div',
        id: 'platform_components_view',

        template: _.template(platformComponentsTemplate),

        events: {
            "click .configurationManager": "openConfigManager"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            this.configManagers = new ConfigManagers();
            this.configManagers.on( 'reset', this.addAllConfigManagers, this );
            this.render();
        },

        render: function(){
            this.configManagers.fetch({reset:true});
            if(this.currentConfigManager) {
                var configManagerName = this.currentConfigManager.attributes.name;
                $("#select_button_label").html("Selected Chef: " + configManagerName);
                $("#default_landing_view").hide();
                if(this.currentConfigManager.attributes["continuous_integration_servers"].length > 0) {
                    $("#continuous_integration_setup_landing_view").hide();
                    $("#continuous_integration_table_view").show();
                    this.renderContinuousIntegration();
                } else {
                    $("#continuous_integration_table_view").hide();
                    $("#selected_cm_label").html(configManagerName);
                    $("#continuous_integration_setup_landing_view").show();
                }
            } else {
                $("#continuous_integration_table_view").hide();
                $("#continuous_integration_setup_landing_view").hide();
                $("#default_landing_view").show();
                $("#select_button_label").html("Select Chef");
            }
        },

        addAllConfigManagers: function() {
            $("#config_managers_list").empty();
            this.configManagers.each(function(configManager) {
                // Only Chef is currently supported
                if(configManager.attributes.type === "chef") {
                    $("#config_managers_list").append("<li><a id='"+configManager.id+"' class='configurationManager selectable_item'>"+configManager.attributes.name+"</a></li>");
                }
            });
        },

        renderContinuousIntegration: function() {
            if(this.currentConfigManager) {
                // Set default values
                var componentName = "Name";
                var components = [];
                switch(this.currentConfigManager.attributes.type) {
                    case "chef":
                        this.currentConfigManager.cookbooks = [
                            {
                                "name": "apigee",
                                "community": false,
                                "ci_presence": true,
                                "status": {
                                    "rspec_status": "NONE",
                                    "foodcritic_status": "PASSING",
                                    "syntax_status": "NONE",
                                    "vagrant_ubuntu-12.04_status": "NONE",
                                    "vagrant_centos-6.4_status": "NONE",
                                    "sync_status": "VERSION_NOT_FOUND_IN_REPO"
                                }
                            },
                            {
                                "name": "att_postgresql",
                                "community": false,
                                "ci_presence": true,
                                "status": {
                                    "rspec_status": "PASSING",
                                    "foodcritic_status": "PASSING",
                                    "syntax_status": "PASSING",
                                    "vagrant_ubuntu-12.04_status": "PASSING",
                                    "vagrant_centos-6.4_status": "PASSING",
                                    "sync_status": "IN_SYNC"
                                }
                            },
                            {
                                "name": "oauth_baseos",
                                "community": false,
                                "ci_presence": true,
                                "status": {
                                    "rspec_status": "NONE",
                                    "foodcritic_status": "PASSING",
                                    "syntax_status": "PASSING",
                                    "vagrant_ubuntu-12.04_status": "FAILING",
                                    "vagrant_centos-6.4_status": "FAILING",
                                    "sync_status": "IN_SYNC"
                                }
                            },
                            {
                                "name": "postgresql",
                                "community": true,
                                "ci_presence": false,
                                "status": {
                                    "rspec_status": "NONE",
                                    "foodcritic_status": "NONE",
                                    "syntax_status": "NONE",
                                    "vagrant_ubuntu-12.04_status": "NONE",
                                    "vagrant_centos-6.4_status": "NONE",
                                    "sync_status": "NOT_FOUND_IN_REPO"
                                }
                            }
                        ];
                        componentName = "Cookbook Name";
                        components = this.currentConfigManager.cookbooks;
                        break;
                }

                if(components.length > 0) {
                    var thisView = this;
                    $("#continuous_integration_table").empty();
                    // Build Header of Table
                    var headerColumns = "<th>"+componentName+"</th>";
                    $.each(components[0]["status"], function(key, value) {
                        var columnName = thisView.readify(key);
                        headerColumns += "<th>" + columnName + "</th>";
                    });
                    $("#continuous_integration_table").append("<thead><tr>"+headerColumns+"</tr></thead>");
                    // Build Body of Table
                    var ignored_components = [];
                    $.each(components, function(index, value) {
                        var rowContents = "<td>"+value["name"]+"</td>";
                        $.each(value["status"], function( key, statusValue) {
                            rowContents += "<td>"+statusValue+"</td>";
                        });
                        $("#continuous_integration_table").append("<tr>"+rowContents+"</tr>");
                    });
                }
            } 
        },

        readify: function(string) {
            var stringSplit = string.split("_");
            $.each(stringSplit, function(index, value) {
                stringSplit[index] = value.charAt(0).toUpperCase() + value.slice(1);
            });
            return stringSplit.join(" ");
        },

        openConfigManager: function(event) {
            this.currentConfigManager = this.configManagers.get(event.currentTarget.id);
            this.render();
        },

        close: function(){
            this.$el.remove();
        }

    });

    var platformComponentsView;

    Common.router.on('route:platformComponents', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== platformComponentsView) {
                this.unloadPreviousState();
                platformComponentsView = new PlatformComponentsView();
                this.setPreviousState(platformComponentsView);
            }
            platformComponentsView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return PlatformComponentsView;
});
